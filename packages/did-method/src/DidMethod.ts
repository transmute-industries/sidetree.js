/*
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Config,
  ResponseModel,
  ResponseStatus,
  ProtocolVersionModel,
  IBlockchain,
  ICas,
} from '@sidetree/common';
import {
  BatchScheduler,
  DownloadManager,
  Observer,
  Resolver,
  ServiceInfo,
  VersionManager,
} from '@sidetree/core';
import {
  MongoDbOperationStore,
  MongoDbOperationQueue,
  MongoDbTransactionStore,
  MongoDbUnresolvableTransactionStore,
} from '@sidetree/db';

/**
 * The core class that is instantiated when running a Sidetree node.
 */
export default class DidMethod {
  static readonly cachedBlockchainTimeRefreshInSeconds = 60;
  public transactionStore: MongoDbTransactionStore;
  private unresolvableTransactionStore: MongoDbUnresolvableTransactionStore;
  public operationStore: MongoDbOperationStore;
  public versionManager: VersionManager;
  public blockchain: IBlockchain;
  private cas: ICas;
  private downloadManager: DownloadManager;
  private observer: Observer;
  private batchScheduler: BatchScheduler;
  private resolver: Resolver;
  private serviceInfo: ServiceInfo;

  public constructor(
    config: Config,
    protocolVersions: ProtocolVersionModel[],
    blockchain: IBlockchain,
    cas: ICas
  ) {
    // Component dependency construction & injection.
    this.versionManager = new VersionManager(config, protocolVersions); // `VersionManager` is first constructed component.
    this.operationStore = new MongoDbOperationStore(
      config.mongoDbConnectionString,
      config.databaseName
    );
    this.blockchain = blockchain;
    this.cas = cas;
    this.downloadManager = new DownloadManager(
      config.maxConcurrentDownloads,
      this.cas
    );
    this.resolver = new Resolver(this.versionManager, this.operationStore);
    this.batchScheduler = new BatchScheduler(
      this.versionManager,
      this.blockchain,
      config.batchingIntervalInSeconds
    );
    this.transactionStore = new MongoDbTransactionStore(
      config.mongoDbConnectionString,
      config.databaseName
    );
    this.unresolvableTransactionStore = new MongoDbUnresolvableTransactionStore(
      config.mongoDbConnectionString,
      config.databaseName
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

    this.serviceInfo = new ServiceInfo('core');
  }

  /**
   * The initialization method that must be called before consumption of this core object.
   * The method starts the Observer and Batch Writer.
   */
  public async initialize(
    startObserver = true,
    startBatchWriter = true,
    startPeriodicCachedBlockchainTimeRefresh = false
  ): Promise<void> {
    await this.transactionStore.initialize();
    await this.unresolvableTransactionStore.initialize();
    await this.operationStore.initialize();
    await this.blockchain.initialize();
    await this.cas.initialize();
    await this.versionManager.initialize(
      this.blockchain,
      this.cas,
      this.downloadManager,
      this.operationStore,
      this.resolver,
      this.transactionStore
    ); // `VersionManager` is last initialized component.

    if (startObserver) {
      await this.observer.startPeriodicProcessing();
    }

    if (startBatchWriter) {
      this.batchScheduler.startPeriodicBatchWriting();
    }
    if (startPeriodicCachedBlockchainTimeRefresh) {
      this.startPeriodicCachedBlockchainTimeRefresh();
    }
    this.downloadManager.start();
  }

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  public startPeriodicCachedBlockchainTimeRefresh: VoidFunction = () => {
    setInterval(
      async () => this.blockchain.getLatestTime(),
      DidMethod.cachedBlockchainTimeRefreshInSeconds * 1000
    );
  };

  public async triggerBatchWriting(): Promise<void> {
    await this.batchScheduler.writeOperationBatch();
  }

  public async triggerProcessTransactions(): Promise<void> {
    // By passing true, we force the observer to wait for all transactions
    // to be downloaded before returning. We need that for testing
    await this.observer.refreshLastKnownTransaction();
    await this.observer.processTransactions(true);
  }

  public async triggerBatchAndObserve(): Promise<void> {
    await this.triggerBatchWriting();
    await this.triggerProcessTransactions();
  }

  public async close(): Promise<void> {
    const currentTime = this.blockchain.approximateTime;
    const operationQueue = this.versionManager.getOperationQueue(
      currentTime.time
    );
    if (operationQueue) {
      await (operationQueue as MongoDbOperationQueue).close();
    }
    await this.transactionStore.close();
    await this.unresolvableTransactionStore.close();
    await this.operationStore.close();
    await this.observer.stopPeriodicProcessing();
    await this.cas.close();
    this.batchScheduler.stopPeriodicBatchWriting();
  }

  /**
   * Handles an operation request.
   */
  public async handleOperationRequest(request: Buffer): Promise<ResponseModel> {
    const currentTime = this.blockchain.approximateTime;
    const requestHandler = this.versionManager.getRequestHandler(
      currentTime.time
    );
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
    const currentTime = this.blockchain.approximateTime;
    const requestHandler = this.versionManager.getRequestHandler(
      currentTime.time
    );
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
      await this.cas.getServiceVersion(),
    ];

    return {
      status: ResponseStatus.Succeeded,
      body: JSON.stringify(responses),
    };
  }
}
