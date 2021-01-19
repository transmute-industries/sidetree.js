/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
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
  AbstractVersionMetadata,
  Config,
  CoreErrorCode,
  IBatchWriter,
  IBlockchain,
  ICas,
  IOperationProcessor,
  IOperationStore,
  IRequestHandler,
  ITransactionProcessor,
  ITransactionSelector,
  ITransactionStore,
  IVersionManager,
  IVersionMetadataFetcher,
  ProtocolVersionModel,
  SidetreeError,
  IOperationQueue,
} from '@sidetree/common';
import DownloadManager from './DownloadManager';
import Resolver from './Resolver';
import { MongoDbOperationQueue } from '@sidetree/db';
import TransactionProcessor from './TransactionProcessor';
import TransactionSelector from './TransactionSelector';
import BatchWriter from './write/BatchWriter';
import OperationProcessor from './OperationProcessor';
import RequestHandler from './RequestHandler';
import VersionMetadata from './VersionMetadata';

/**
 * The class that handles the loading of different versions of protocol codebase.
 */
export default class VersionManager
  implements IVersionManager, IVersionMetadataFetcher {
  public allSupportedHashAlgorithms: number[] = [];

  // Reverse sorted protocol versions. ie. latest version first.
  private protocolVersionsReverseSorted: ProtocolVersionModel[];

  private batchWriters: Map<string, IBatchWriter>;
  private operationProcessors: Map<string, IOperationProcessor>;
  private operationQueues: Map<string, IOperationQueue>;
  private requestHandlers: Map<string, IRequestHandler>;
  private transactionProcessors: Map<string, ITransactionProcessor>;
  private transactionSelectors: Map<string, ITransactionSelector>;
  private versionMetadatas: Map<string, AbstractVersionMetadata>;

  public constructor(
    private config: Config,
    protocolVersions: ProtocolVersionModel[]
  ) {
    // Reverse sort protocol versions.
    this.protocolVersionsReverseSorted = protocolVersions.sort(
      (a, b) => b.startingBlockchainTime - a.startingBlockchainTime
    );

    this.batchWriters = new Map();
    this.operationProcessors = new Map();
    this.operationQueues = new Map();
    this.requestHandlers = new Map();
    this.transactionProcessors = new Map();
    this.transactionSelectors = new Map();
    this.versionMetadatas = new Map();
  }

  /**
   * Loads all the versions of the protocol codebase.
   */
  public async initialize(
    blockchain: IBlockchain,
    cas: ICas,
    downloadManager: DownloadManager,
    operationStore: IOperationStore,
    resolver: Resolver,
    transactionStore: ITransactionStore
  ): Promise<void> {
    // Instantiate rest of the protocol components.
    // NOTE: In principal each version of the interface implemtnations can have different constructors,
    // but we currently keep the constructor signature the same as much as possible for simple instance construction,
    // but it is not inherently "bad" if we have to have conditional constructions for each if we have to.
    for (const protocolVersion of this.protocolVersionsReverseSorted) {
      const version = protocolVersion.version;

      /* tslint:disable-next-line */
      const MongoDbOperationQueue = await this.loadDefaultExportsForVersion(
        version,
        'MongoDbOperationQueue'
      );
      const operationQueue = new MongoDbOperationQueue(
        this.config.mongoDbConnectionString,
        this.config.databaseName
      );
      await operationQueue.initialize();
      this.operationQueues.set(version, operationQueue);

      /* tslint:disable-next-line */
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

      /* tslint:disable-next-line */
      const TransactionSelector = await this.loadDefaultExportsForVersion(
        version,
        'TransactionSelector'
      );
      const transactionSelector = new TransactionSelector(transactionStore);
      this.transactionSelectors.set(version, transactionSelector);

      /* tslint:disable-next-line */
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

      /* tslint:disable-next-line */
      const OperationProcessor = await this.loadDefaultExportsForVersion(
        version,
        'OperationProcessor'
      );
      const operationProcessor = new OperationProcessor();
      this.operationProcessors.set(version, operationProcessor);

      /* tslint:disable-next-line */
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

      /* tslint:disable-next-line */
      const VersionMetadata = await this.loadDefaultExportsForVersion(
        version,
        'VersionMetadata'
      );
      const versionMetadata = new VersionMetadata();
      if (!(versionMetadata instanceof AbstractVersionMetadata)) {
        throw new SidetreeError(
          CoreErrorCode.VersionManagerVersionMetadataIncorrectType,
          `make sure VersionMetaData is properly implemented for version ${version}`
        );
      }
      this.versionMetadatas.set(version, versionMetadata);
    }

    // Get and cache supported hash algorithms.
    const hashAlgorithmsWithDuplicates = Array.from(
      this.versionMetadatas.values(),
      (value) => value.hashAlgorithmInMultihashCode
    );
    this.allSupportedHashAlgorithms = Array.from(
      new Set(hashAlgorithmsWithDuplicates)
    ); // This line removes duplicates.
  }

  /**
   * Gets the corresponding version of the `IBatchWriter` based on the given blockchain time.
   */
  public getBatchWriter(blockchainTime: number): IBatchWriter {
    const version = this.getVersionString(blockchainTime);
    const batchWriter = this.batchWriters.get(version);

    if (batchWriter === undefined) {
      throw new SidetreeError(
        CoreErrorCode.VersionManagerBatchWriterNotFound,
        `Batch writer for blockchain time ${blockchainTime} not found.`
      );
    }

    return batchWriter;
  }

  /**
   * Gets the corresponding version of the `IOperationProcessor` based on the given blockchain time.
   */
  public getOperationProcessor(blockchainTime: number): IOperationProcessor {
    const version = this.getVersionString(blockchainTime);
    const operationProcessor = this.operationProcessors.get(version);

    if (operationProcessor === undefined) {
      throw new SidetreeError(
        CoreErrorCode.VersionManagerOperationProcessorNotFound,
        `Operation processor for blockchain time ${blockchainTime} not found.`
      );
    }

    return operationProcessor;
  }

  /**
   * Gets the corresponding version of the `IRequestHandler` based on the given blockchain time.
   */
  public getRequestHandler(blockchainTime: number): IRequestHandler {
    const version = this.getVersionString(blockchainTime);
    const requestHandler = this.requestHandlers.get(version);

    if (requestHandler === undefined) {
      throw new SidetreeError(
        CoreErrorCode.VersionManagerRequestHandlerNotFound,
        `Request handler for blockchain time ${blockchainTime} not found.`
      );
    }

    return requestHandler;
  }

  /**
   * Gets the corresponding version of the `TransactionProcessor` based on the given blockchain time.
   */
  public getTransactionProcessor(
    blockchainTime: number
  ): ITransactionProcessor {
    const version = this.getVersionString(blockchainTime);
    const transactionProcessor = this.transactionProcessors.get(version);

    if (transactionProcessor === undefined) {
      throw new SidetreeError(
        CoreErrorCode.VersionManagerTransactionProcessorNotFound,
        `Transaction processor for blockchain time ${blockchainTime} not found.`
      );
    }

    return transactionProcessor;
  }

  /**
   * Gets the corresponding version of the `TransactionSelector` based on the given blockchain time.
   */
  public getTransactionSelector(blockchainTime: number): ITransactionSelector {
    const version = this.getVersionString(blockchainTime);
    const transactionSelector = this.transactionSelectors.get(version);

    if (transactionSelector === undefined) {
      throw new SidetreeError(
        CoreErrorCode.VersionManagerTransactionSelectorNotFound,
        `Transaction selector for blockchain time ${blockchainTime} not found.`
      );
    }

    return transactionSelector;
  }

  public getVersionMetadata(blockchainTime: number): AbstractVersionMetadata {
    const versionString = this.getVersionString(blockchainTime);
    const versionMetadata = this.versionMetadatas.get(versionString);
    // this is always be defined because if blockchain time is found, version will be defined
    return versionMetadata!;
  }

  public getOperationQueue(blockchainTime: number): IOperationQueue {
    const versionString = this.getVersionString(blockchainTime);
    const operationQueue = this.operationQueues.get(versionString);
    // this is always be defined because if blockchain time is found, version will be defined
    return operationQueue!;
  }

  /**
   * Gets the corresponding protocol version string given the blockchain time.
   */
  private getVersionString(blockchainTime: number): string {
    // Iterate through each version to find the right version.
    for (const protocolVersion of this.protocolVersionsReverseSorted) {
      if (blockchainTime >= protocolVersion.startingBlockchainTime) {
        return protocolVersion.version;
      }
    }

    throw new SidetreeError(
      CoreErrorCode.VersionManagerVersionStringNotFound,
      `Unable to find version string for blockchain time ${blockchainTime}.`
    );
  }

  private async loadDefaultExportsForVersion(
    version: string,
    className: string
  ): Promise<any> {
    if (version === 'latest') {
      switch (className) {
        case 'MongoDbOperationQueue':
          return MongoDbOperationQueue;
        case 'TransactionProcessor':
          return TransactionProcessor;
        case 'TransactionSelector':
          return TransactionSelector;
        case 'BatchWriter':
          return BatchWriter;
        case 'OperationProcessor':
          return OperationProcessor;
        case 'RequestHandler':
          return RequestHandler;
        case 'VersionMetadata':
          return VersionMetadata;
        default:
          return;
      }
    }
    return (await import(`./versions/${version}/${className}`)).default;
  }
}
