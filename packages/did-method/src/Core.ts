import semver from 'semver';
import timeSpan from 'time-span';

import {
  MongoDbOperationStore,
  MongoDbUnresolvableTransactionStore,
  MongoDbTransactionStore,
  MongoDbServiceStateStore,
} from '@sidetree/db';

import {
  VersionManager,
  SidetreeError,
  ServiceStateModel,
  ServiceInfoProvider,
  Resolver,
  Observer,
  EventEmitter,
  ErrorCode,
  DownloadManager,
  Config,
  BatchScheduler,
  BlockchainClock,
} from '@sidetree/core';

import {
  VersionModel,
  ResponseStatus,
  ResponseModel,
  ICas,
  IEventEmitter,
  ILogger,
  IBlockchain,
  Logger,
  LogColor,
} from '@sidetree/common';

/**
 * The core class that is instantiated when running a Sidetree node.
 */
export default class Core {
  /** Monitor of the running Core service. */
  //   public monitor: Monitor;

  private serviceStateStore: MongoDbServiceStateStore<ServiceStateModel>;
  private transactionStore: MongoDbTransactionStore;
  private unresolvableTransactionStore: MongoDbUnresolvableTransactionStore;
  private operationStore: MongoDbOperationStore;
  private versionManager: VersionManager;
  private downloadManager: DownloadManager;
  private observer: Observer;
  private batchScheduler: BatchScheduler;
  private resolver: Resolver;
  private serviceInfo: ServiceInfoProvider;
  private blockchainClock: BlockchainClock;

  /**
   * Core constructor.
   */
  public constructor(
    private config: Config,
    versionModels: VersionModel[],
    private cas: ICas,
    private blockchain: IBlockchain
  ) {
    // Component dependency construction & injection.
    this.versionManager = new VersionManager(config, versionModels); // `VersionManager` is first constructed component as multiple components depend on it.
    this.serviceInfo = new ServiceInfoProvider('core');
    this.serviceStateStore = new MongoDbServiceStateStore(
      this.config.mongoDbConnectionString,
      this.config.databaseName
    );
    this.operationStore = new MongoDbOperationStore(
      config.mongoDbConnectionString,
      config.databaseName
    );
    this.downloadManager = new DownloadManager(
      config.maxConcurrentDownloads,
      this.cas
    );
    this.resolver = new Resolver(this.versionManager, this.operationStore);
    this.transactionStore = new MongoDbTransactionStore();
    this.unresolvableTransactionStore = new MongoDbUnresolvableTransactionStore(
      config.mongoDbConnectionString,
      config.databaseName
    );

    // Only enable real blockchain time pull if observer is enabled
    const enableRealBlockchainTimePull = config.observingIntervalInSeconds > 0;
    this.blockchainClock = new BlockchainClock(
      this.blockchain,
      this.serviceStateStore,
      enableRealBlockchainTimePull
    );

    this.batchScheduler = new BatchScheduler(
      this.versionManager,
      this.blockchain,
      config.batchingIntervalInSeconds
    );
    this.observer = new Observer(
      this.versionManager,
      this.blockchain,
      config.maxConcurrentDownloads,
      this.operationStore,
      this.transactionStore,
      this.unresolvableTransactionStore,
      config.observingIntervalInSeconds
    );

    // this.monitor = new Monitor();
  }

  /**
   * The initialization method that must be called before consumption of this core object.
   * The method starts the Observer and Batch Writer.
   */
  public async initialize(
    customLogger?: ILogger,
    customEventEmitter?: IEventEmitter
  ) {
    Logger.initialize(customLogger);
    EventEmitter.initialize(customEventEmitter);

    // DB initializations.
    await this.serviceStateStore.initialize();
    await this.transactionStore.initialize(
      this.config.mongoDbConnectionString,
      this.config.databaseName
    );
    await this.unresolvableTransactionStore.initialize();
    await this.operationStore.initialize();
    await this.upgradeDatabaseIfNeeded();

    await this.versionManager.initialize(
      this.blockchain,
      this.cas,
      this.downloadManager,
      this.operationStore,
      this.resolver,
      this.transactionStore
    ); // `VersionManager` is last initialized component as it needs many shared/common components to be ready first.

    if (this.config.observingIntervalInSeconds > 0) {
      await this.observer.startPeriodicProcessing();
    } else {
      Logger.warn(LogColor.yellow(`Transaction observer is disabled.`));
    }

    // Only pull real blockchain time when observer is enabled, else only read from db.
    await this.blockchainClock.startPeriodicPullLatestBlockchainTime();

    if (this.config.batchingIntervalInSeconds > 0) {
      this.batchScheduler.startPeriodicBatchWriting();
    } else {
      Logger.warn(LogColor.yellow(`Batch writing is disabled.`));
    }

    this.downloadManager.start();
  }

  public async shutdown() {
    this.observer.stopPeriodicProcessing();
    this.batchScheduler.stopPeriodicBatchWriting();
    this.blockchainClock.stopPeriodicPullLatestBlockchainTime();

    await new Promise((resolve) => {
      setTimeout(resolve, this.config.observingIntervalInSeconds * 1000);
    });

    this.downloadManager.stop();

    await this.serviceStateStore.stop();
    await this.transactionStore.stop();
    await this.unresolvableTransactionStore.stop();
    await this.operationStore.stop();

    await this.versionManager.stop();

    await new Promise((resolve) => {
      setTimeout(resolve, 1 * 1000);
    });
  }

  /**
   * Handles an operation request.
   */
  public async handleOperationRequest(request: Buffer): Promise<ResponseModel> {
    const currentTime = this.blockchainClock.getTime()!;
    const requestHandler = this.versionManager.getRequestHandler(currentTime);
    const response = requestHandler.handleOperationRequest(request);
    return response;
  }

  /**
   * Handles resolve operation.
   * @param didOrDidDocument Can either be:
   *   1. Fully qualified DID. e.g. 'did:sidetree:abc' or
   *   2. An encoded DID Document prefixed by the DID method name. e.g. 'did:sidetree:<encoded-DID-Document>'.
   */
  public async handleResolveRequest(
    didOrDidDocument: string
  ): Promise<ResponseModel> {
    const currentTime = this.blockchainClock.getTime()!;
    const requestHandler = this.versionManager.getRequestHandler(currentTime);
    const response = requestHandler.handleResolveRequest(didOrDidDocument);
    return response;
  }

  /**
   * Handles the get version request. It gets the versions from the dependent services
   * as well.
   */
  public async handleGetVersionRequest(): Promise<ResponseModel> {
    const responses = [
      this.serviceInfo.getServiceVersion(),
      await this.blockchain.getServiceVersion(),
    ];

    return {
      status: ResponseStatus.Succeeded,
      body: JSON.stringify(responses),
    };
  }

  private async upgradeDatabaseIfNeeded() {
    // If this node is not the active Observer node, do not perform DB upgrade.
    // Since only one active Observer is supported, this ensures only one node is performing the DB upgrade.
    if (this.config.observingIntervalInSeconds === 0) {
      return;
    }

    const expectedDbVersion = '1.0.1';
    const savedServiceState = await this.serviceStateStore.get();
    const actualDbVersion = savedServiceState.databaseVersion;

    if (expectedDbVersion === actualDbVersion) {
      return;
    }

    // Throw if attempting to downgrade.
    if (
      actualDbVersion !== undefined &&
      semver.lt(expectedDbVersion, actualDbVersion)
    ) {
      Logger.error(
        LogColor.red(
          `Downgrading DB from version ${LogColor.green(
            actualDbVersion
          )} to  ${LogColor.green(expectedDbVersion)} is not allowed.`
        )
      );
      throw new SidetreeError(ErrorCode.DatabaseDowngradeNotAllowed);
    }

    // Add DB upgrade code below.

    Logger.warn(
      LogColor.yellow(
        `Upgrading DB from version ${LogColor.green(
          actualDbVersion
        )} to ${LogColor.green(expectedDbVersion)}...`
      )
    );

    // Current upgrade action is simply clearing/deleting existing DB such that initial sync can occur from genesis block.
    const timer = timeSpan();
    await this.operationStore.delete();
    await this.transactionStore.clearCollection();
    await this.unresolvableTransactionStore.clearCollection();
    await this.operationStore.createIndex();
    await this.serviceStateStore.put({ databaseVersion: expectedDbVersion });

    Logger.warn(
      LogColor.yellow(`DB upgraded in: ${LogColor.green(timer.rounded())} ms.`)
    );
  }
}
