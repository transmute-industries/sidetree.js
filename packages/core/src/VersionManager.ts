import {
  Config,
  ErrorCode,
  SidetreeError,
  VersionModel,
  IVersionMetadataFetcher,
  IVersionManager,
  ITransactionStore,
  ITransactionSelector,
  ITransactionProcessor,
  IRequestHandler,
  IOperationStore,
  IOperationProcessor,
  ICas,
  IBlockchain,
  IBatchWriter,
  AbstractVersionMetadata,
} from '@evan.network/sidetree-common';

import DownloadManager from './DownloadManager';
import Resolver from './Resolver';
import { versions } from './versions';

/**
 * The class that handles code versioning.
 */
export default class VersionManager
  implements IVersionManager, IVersionMetadataFetcher {
  // Reverse sorted implementation versions. ie. latest version first.
  private versionsReverseSorted: VersionModel[];

  private batchWriters: Map<string, IBatchWriter>;
  private operationProcessors: Map<string, IOperationProcessor>;
  private requestHandlers: Map<string, IRequestHandler>;
  private transactionProcessors: Map<string, ITransactionProcessor>;
  private transactionSelectors: Map<string, ITransactionSelector>;
  private versionMetadatas: Map<string, AbstractVersionMetadata>;
  private references: any[];

  public constructor(
    private config: Config,
    sidetreeCoreVersions: VersionModel[]
  ) {
    // Reverse sort versions.
    this.versionsReverseSorted = sidetreeCoreVersions.sort(
      (a, b) => b.startingBlockchainTime - a.startingBlockchainTime
    );

    this.batchWriters = new Map();
    this.operationProcessors = new Map();
    this.requestHandlers = new Map();
    this.transactionProcessors = new Map();
    this.transactionSelectors = new Map();
    this.versionMetadatas = new Map();

    this.references = [];
  }

  /**
   * Loads all the implementation versions.
   */
  public async initialize(
    blockchain: IBlockchain,
    cas: ICas,
    downloadManager: DownloadManager,
    operationStore: IOperationStore,
    resolver: Resolver,
    transactionStore: ITransactionStore
  ) {
    // NOTE: In principal each version of the interface implementations can have different constructors,
    // but we currently keep the constructor signature the same as much as possible for simple instance construction,
    // but it is not inherently "bad" if we have to have conditional constructions for each if we have to.
    for (const versionModel of this.versionsReverseSorted) {
      const version = versionModel.version;

      const MongoDbOperationQueue = await this.loadDefaultExportsForVersion(
        version,
        'MongoDbOperationQueue'
      );
      const operationQueue = new MongoDbOperationQueue();
      await operationQueue.initialize(
        this.config.mongoDbConnectionString,
        this.config.databaseName
      );
      this.references.push(operationQueue);

      const TransactionProcessor = await this.loadDefaultExportsForVersion(
        version,
        'TransactionProcessor'
      );
      const transactionProcessor = new TransactionProcessor(
        downloadManager,
        operationStore,
        blockchain,
        this
      );
      this.transactionProcessors.set(version, transactionProcessor);
      this.references.push(transactionProcessor);

      const TransactionSelector = await this.loadDefaultExportsForVersion(
        version,
        'TransactionSelector'
      );
      const transactionSelector = new TransactionSelector(transactionStore);
      this.transactionSelectors.set(version, transactionSelector);

      const BatchWriter = await this.loadDefaultExportsForVersion(
        version,
        'BatchWriter'
      );
      const batchWriter = new BatchWriter(
        operationQueue,
        blockchain,
        cas,
        this
      );
      this.batchWriters.set(version, batchWriter);
      this.references.push(batchWriter);

      const OperationProcessor = await this.loadDefaultExportsForVersion(
        version,
        'OperationProcessor'
      );
      const operationProcessor = new OperationProcessor();
      this.operationProcessors.set(version, operationProcessor);
      this.references.push(operationProcessor);

      const RequestHandler = await this.loadDefaultExportsForVersion(
        version,
        'RequestHandler'
      );
      const requestHandler = new RequestHandler(
        resolver,
        operationQueue,
        this.config.didMethodName
      );
      this.requestHandlers.set(version, requestHandler);

      const VersionMetadata = await this.loadDefaultExportsForVersion(
        version,
        'VersionMetadata'
      );
      const versionMetadata = new VersionMetadata();
      if (!(versionMetadata instanceof AbstractVersionMetadata)) {
        throw new SidetreeError(
          ErrorCode.VersionManagerVersionMetadataIncorrectType,
          `make sure VersionMetaData is properly implemented for version ${version}`
        );
      }
      this.versionMetadatas.set(version, versionMetadata);
    }
  }

  public async stop(): Promise<void> {
    for (const value of this.references) {
      if (value.stop) {
        await value.stop();
      }
    }
  }

  /**
   * Gets the corresponding version of the `IBatchWriter` based on the given blockchain time.
   */
  public getBatchWriter(blockchainTime: number): IBatchWriter {
    const version = this.getVersionString(blockchainTime);
    const batchWriter = this.batchWriters.get(version)!;
    return batchWriter;
  }

  /**
   * Gets the corresponding version of the `IOperationProcessor` based on the given blockchain time.
   */
  public getOperationProcessor(blockchainTime: number): IOperationProcessor {
    const version = this.getVersionString(blockchainTime);
    const operationProcessor = this.operationProcessors.get(version)!;
    return operationProcessor;
  }

  /**
   * Gets the corresponding version of the `IRequestHandler` based on the given blockchain time.
   */
  public getRequestHandler(blockchainTime: number): IRequestHandler {
    const version = this.getVersionString(blockchainTime);
    const requestHandler = this.requestHandlers.get(version)!;
    return requestHandler;
  }

  /**
   * Gets the corresponding version of the `TransactionProcessor` based on the given blockchain time.
   */
  public getTransactionProcessor(
    blockchainTime: number
  ): ITransactionProcessor {
    const version = this.getVersionString(blockchainTime);
    const transactionProcessor = this.transactionProcessors.get(version)!;
    return transactionProcessor;
  }

  /**
   * Gets the corresponding version of the `TransactionSelector` based on the given blockchain time.
   */
  public getTransactionSelector(blockchainTime: number): ITransactionSelector {
    const version = this.getVersionString(blockchainTime);
    const transactionSelector = this.transactionSelectors.get(version)!;
    return transactionSelector;
  }

  public getVersionMetadata(blockchainTime: number): AbstractVersionMetadata {
    const versionString = this.getVersionString(blockchainTime);
    const versionMetadata = this.versionMetadatas.get(versionString);
    // this is always be defined because if blockchain time is found, version will be defined
    return versionMetadata!;
  }

  /**
   * Gets the corresponding implementation version string given the blockchain time.
   */
  private getVersionString(blockchainTime: number): string {
    // Iterate through each version to find the right version.
    for (const versionModel of this.versionsReverseSorted) {
      if (blockchainTime >= versionModel.startingBlockchainTime) {
        return versionModel.version;
      }
    }

    throw new SidetreeError(
      ErrorCode.VersionManagerVersionStringNotFound,
      `Unable to find version string for blockchain time ${blockchainTime}.`
    );
  }

  private async loadDefaultExportsForVersion(
    version: string,
    className: string
  ): Promise<any> {
    const SidetreeClassForVersion = versions[version][className];
    return SidetreeClassForVersion;
  }
}
