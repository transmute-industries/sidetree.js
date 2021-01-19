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

import retry from 'async-retry';
import {
  AnchoredDataSerializer,
  IOperationStore,
  Encoder,
  SharedErrorCode,
  FetchResult,
  FetchResultCode,
  IVersionManager,
  SidetreeError,
  TransactionModel,
  Multihash,
} from '@sidetree/common';
import AnchorFile from '../write/AnchorFile';
import { MockLedger } from '@sidetree/ledger';
import { MockCas } from '@sidetree/cas';
import ChunkFile from '../write/ChunkFile';
import DownloadManager from '../DownloadManager';
import MapFile from '../write/MapFile';
import MockOperationStore from './mocks/MockOperationStore';
import MockTransactionStore from './mocks/MockTransactionStore';
import MockVersionManager from './mocks/MockVersionManager';
import Observer from '../Observer';
import OperationGenerator from './generators/OperationGenerator';
import TransactionSelector from '../TransactionSelector';
import TransactionProcessor from '../TransactionProcessor';

console.info = (): null => null;

describe('Observer', () => {
  const config = require('./config-test.json');

  let casClient;
  let downloadManager: DownloadManager;
  let operationStore: IOperationStore;
  let transactionStore: MockTransactionStore;
  let blockchain: MockLedger;
  let versionManager: IVersionManager;

  beforeAll(async () => {
    jest.setTimeout(20000); // These asynchronous tests can take a bit longer than normal.

    casClient = new MockCas();

    // Setting the CAS to always return 404.
    const readSpy = jest.spyOn(casClient, 'read');
    readSpy.mockReturnValue(
      Promise.resolve({ code: FetchResultCode.NotFound })
    );

    operationStore = new MockOperationStore();
    transactionStore = new MockTransactionStore();
    downloadManager = new DownloadManager(
      config.maxConcurrentDownloads,
      casClient
    );
    downloadManager.start();
    blockchain = new MockLedger();
    const versionMetadataFetcher = {} as any;

    // Mock the blockchain to return an empty lock
    const valueSpy = jest.spyOn(blockchain, 'getValueTimeLock');
    valueSpy.mockReturnValue(Promise.resolve(undefined));

    const transactionProcessor = new TransactionProcessor(
      downloadManager,
      operationStore,
      blockchain,
      versionMetadataFetcher
    );
    const transactionSelector = new TransactionSelector(transactionStore);
    versionManager = new MockVersionManager();

    const transactionProcessorSpy = jest.spyOn(
      versionManager,
      'getTransactionProcessor'
    );
    transactionProcessorSpy.mockReturnValue(transactionProcessor);
    const transactionSelectorSpy = jest.spyOn(
      versionManager,
      'getTransactionSelector'
    );
    transactionSelectorSpy.mockReturnValue(transactionSelector);
  });

  beforeEach(() => {
    transactionStore = new MockTransactionStore();
  });

  it('should record transactions processed with expected outcome.', async () => {
    // Prepare the mock response from blockchain service.
    const initialTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 1,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          transactionHash: '1000',
          anchorString: '1stTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1',
        },
        {
          transactionNumber: 2,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          transactionHash: '1000',
          anchorString: '2ndTransaction',
          transactionFeePaid: 2,
          normalizedTransactionFee: 2,
          writer: 'writer2',
        },
      ],
    };
    const subsequentTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [],
    };

    const blockchainClient = new MockLedger();

    let readInvocationCount = 0;
    const mockReadFunction = async (): Promise<{
      moreTransactions: boolean;
      transactions: TransactionModel[];
    }> => {
      readInvocationCount++;
      if (readInvocationCount === 1) {
        return initialTransactionFetchResponseBody;
      } else {
        return subsequentTransactionFetchResponseBody;
      }
    };
    const readSpy = jest.spyOn(blockchainClient, 'read');
    readSpy.mockImplementation(mockReadFunction);

    // Start the Observer.
    const observer = new Observer(
      versionManager,
      blockchainClient,
      config.maxConcurrentDownloads,
      operationStore,
      transactionStore,
      transactionStore,
      1
    );

    // mocking throughput limiter to make testing easier
    const throughputspy = jest.spyOn(
      observer['throughputLimiter'],
      'getQualifiedTransactions'
    );
    throughputspy.mockImplementation((transactions: TransactionModel[]) => {
      return new Promise((resolve) => {
        resolve(transactions);
      });
    });

    const processedTransactions = transactionStore.getTransactions();
    await observer.startPeriodicProcessing(); // Asynchronously triggers Observer to start processing transactions immediately.

    // Monitor the processed transactions list until change is detected or max retries is reached.
    await retry(
      async () => {
        const processedTransactionCount = transactionStore.getTransactions()
          .length;
        if (processedTransactionCount === 2) {
          return;
        }

        // NOTE: if anything throws, we retry.
        throw new Error(
          'Incorrect number of changes to the processed transactions list.'
        );
      },
      {
        retries: 10,
        minTimeout: 500, // milliseconds
        maxTimeout: 500, // milliseconds
      }
    );

    observer.stopPeriodicProcessing(); // Asynchronously stops Observer from processing more transactions after the initial processing cycle.

    // throughput limiter applies logic to filter out some transactions
    expect(processedTransactions.length).toEqual(2);
    expect(processedTransactions[0].anchorString).toEqual('1stTransaction');
    expect(processedTransactions[1].anchorString).toEqual('2ndTransaction');
  });

  it('should process a valid operation batch successfully.', async () => {
    const operation1Data = await OperationGenerator.generateAnchoredCreateOperation(
      { transactionTime: 1, transactionNumber: 1, operationIndex: 1 }
    );
    const operation2Data = await OperationGenerator.generateAnchoredCreateOperation(
      { transactionTime: 1, transactionNumber: 1, operationIndex: 2 }
    );
    const createOperations = [
      operation1Data.createOperation,
      operation2Data.createOperation,
    ];

    // Generating chunk file data.
    const mockbChunkFileBuffer = await ChunkFile.createBuffer(
      createOperations,
      [],
      []
    );
    const mockChunkFileFetchResult: FetchResult = {
      code: FetchResultCode.Success,
      content: mockbChunkFileBuffer,
    };
    const mockChunkFilehash = Encoder.encode(
      Multihash.hash(Buffer.from('MockChunkFileHash'))
    );

    // Generating map file data.
    const mockMapFileBuffer = await MapFile.createBuffer(mockChunkFilehash, []);
    const mockMapFileHash = Encoder.encode(
      Multihash.hash(Buffer.from('MockMapFileHash'))
    );
    const mockMapFileFetchResult: FetchResult = {
      code: FetchResultCode.Success,
      content: mockMapFileBuffer,
    };

    // Generating anchor file data.
    const mockAnchorFileBuffer = await AnchorFile.createBuffer(
      'writerlock',
      mockMapFileHash,
      createOperations,
      [],
      []
    );
    const mockAnchoreFileFetchResult: FetchResult = {
      code: FetchResultCode.Success,
      content: mockAnchorFileBuffer,
    };
    const mockAnchorFilehash = Encoder.encode(
      Multihash.hash(Buffer.from('MockAnchorFileHash'))
    );

    // Prepare the mock fetch results from the `DownloadManager.download()`.
    const mockDownloadFunction = async (hash: string): Promise<FetchResult> => {
      if (hash === mockAnchorFilehash) {
        return mockAnchoreFileFetchResult;
      } else if (hash === mockMapFileHash) {
        return mockMapFileFetchResult;
      } else if (hash === mockChunkFilehash) {
        return mockChunkFileFetchResult;
      } else {
        throw new Error('Test failed, unexpected hash given');
      }
    };
    const downloadSpy = jest.spyOn(downloadManager, 'download');
    downloadSpy.mockImplementation(mockDownloadFunction);

    const blockchainClient = new MockLedger();
    const observer = new Observer(
      versionManager,
      blockchainClient,
      config.maxConcurrentDownloads,
      operationStore,
      transactionStore,
      transactionStore,
      1
    );

    const anchoredData = AnchoredDataSerializer.serialize({
      anchorFileHash: mockAnchorFilehash,
      numberOfOperations: createOperations.length,
    });
    const mockTransaction: TransactionModel = {
      transactionNumber: 1,
      transactionTime: 1000000,
      transactionHash: 'hash',
      transactionTimeHash: '1000',
      anchorString: anchoredData,
      transactionFeePaid: 1,
      normalizedTransactionFee: 1,
      writer: 'writer',
    };
    const transactionUnderProcessing = {
      transaction: mockTransaction,
      processingStatus: 'pending',
    };
    await (observer as any).processTransaction(
      mockTransaction,
      transactionUnderProcessing
    );

    const didUniqueSuffixes = createOperations.map(
      (operation) => operation.didUniqueSuffix
    );
    for (const didUniqueSuffix of didUniqueSuffixes) {
      const operationArray = await operationStore.get(didUniqueSuffix);
      expect(operationArray.length).toEqual(1);
    }
  });

  // Testing invalid anchor file scenarios:
  const invalidAnchorFileTestsInput = [
    [FetchResultCode.MaxSizeExceeded, 'exceeded max size limit'],
    [FetchResultCode.NotAFile, 'is not a file'],
    [FetchResultCode.InvalidHash, 'is not a valid hash'],
  ];
  for (const tuple of invalidAnchorFileTestsInput) {
    const mockFetchReturnCode = tuple[0];
    const expectedConsoleLogSubstring = tuple[1];

    it(`should stop processing a transaction if ${mockFetchReturnCode}`, async () => {
      const blockchainClient = new MockLedger();
      const observer = new Observer(
        versionManager,
        blockchainClient,
        config.maxConcurrentDownloads,
        operationStore,
        transactionStore,
        transactionStore,
        1
      );

      const downloadSpy = jest.spyOn(downloadManager, 'download');
      downloadSpy.mockReturnValue(
        Promise.resolve({ code: mockFetchReturnCode as FetchResultCode })
      );

      let expectedConsoleLogDetected = false;
      const consoleSpy = jest.spyOn(global.console, 'info');
      consoleSpy.mockImplementation((message: string) => {
        if (message.includes(expectedConsoleLogSubstring)) {
          expectedConsoleLogDetected = true;
        }
      });

      jest.spyOn(transactionStore, 'removeUnresolvableTransaction');
      jest.spyOn(transactionStore, 'recordUnresolvableTransactionFetchAttempt');

      const anchoredData = AnchoredDataSerializer.serialize({
        anchorFileHash: 'EiA_psBVqsuGjoYXMIRrcW_mPUG1yDXbh84VPXOuVQ5oqw',
        numberOfOperations: 1,
      });
      const mockTransaction: TransactionModel = {
        transactionNumber: 1,
        transactionTime: 1000000,
        transactionHash: 'hash',
        transactionTimeHash: '1000',
        anchorString: anchoredData,
        transactionFeePaid: 1,
        normalizedTransactionFee: 1,
        writer: 'writer',
      };
      const transactionUnderProcessing = {
        transaction: mockTransaction,
        processingStatus: 'pending',
      };
      await (observer as any).processTransaction(
        mockTransaction,
        transactionUnderProcessing
      );

      expect(expectedConsoleLogDetected).toBeTruthy();
      expect(transactionStore.removeUnresolvableTransaction).toHaveBeenCalled();
      expect(
        transactionStore.recordUnresolvableTransactionFetchAttempt
      ).not.toHaveBeenCalled();
    });
  }

  it('should detect and handle block reorganization correctly.', async () => {
    // Prepare the mock response from blockchain service.
    const initialTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 1,
          transactionTime: 1000,
          transactionTimeHash: '1000',
          transactionHash: '1000',
          anchorString: '1stTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1',
        },
        {
          transactionNumber: 2,
          transactionTime: 2000,
          transactionTimeHash: '2000',
          transactionHash: '2000',
          anchorString: '2ndTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer2',
        },
        {
          transactionNumber: 3,
          transactionTime: 3000,
          transactionTimeHash: '3000',
          transactionHash: '3000',
          anchorString: '3rdTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer3',
        },
      ],
    };

    const transactionFetchResponseBodyAfterBlockReorg = {
      moreTransactions: false,
      transactions: [
        {
          transactionNumber: 2,
          transactionTime: 2001,
          transactionTimeHash: '2001',
          transactionHash: '2001',
          anchorString: '2ndTransactionNew',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer1',
        },
        {
          transactionNumber: 3,
          transactionTime: 3001,
          transactionTimeHash: '3000',
          transactionHash: '3001',
          anchorString: '3rdTransactionNew',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer2',
        },
        {
          transactionNumber: 4,
          transactionTime: 4000,
          transactionTimeHash: '4000',
          transactionHash: '4000',
          anchorString: '4thTransaction',
          transactionFeePaid: 1,
          normalizedTransactionFee: 1,
          writer: 'writer3',
        },
      ],
    };
    const subsequentTransactionFetchResponseBody = {
      moreTransactions: false,
      transactions: [],
    };

    const blockchainClient = new MockLedger();

    // Force blockchain time to be higher than the latest known transaction time by core,
    // such that Observer will consider `InvalidTransactionNumberOrTimeHash` a block reorg.
    (blockchainClient as any).latestTime = {
      time: 5000,
      hash: '5000',
    };

    let readInvocationCount = 0;
    const mockReadFunction = async (): Promise<{
      moreTransactions: boolean;
      transactions: TransactionModel[];
    }> => {
      readInvocationCount++;
      if (readInvocationCount === 1) {
        // 1st call returns initial set of transactions.
        return initialTransactionFetchResponseBody;
      }
      if (readInvocationCount === 2) {
        // 2nd call simulates a block reorganization.
        throw new SidetreeError(
          SharedErrorCode.InvalidTransactionNumberOrTimeHash
        );
      }
      if (readInvocationCount === 3) {
        // 3nd call occurs after the 'getFirstValidTransaction' call and returns the 'correct' set of transactions.
        return transactionFetchResponseBodyAfterBlockReorg;
      } else {
        return subsequentTransactionFetchResponseBody;
      }
    };
    const readSpy = jest.spyOn(blockchainClient, 'read');
    readSpy.mockImplementation(mockReadFunction);

    // Make the `getFirstValidTransaction` call return the first transaction as the most recent knwon valid transactions.
    const getTransactionSpy = jest.spyOn(
      blockchainClient,
      'getFirstValidTransaction'
    );
    getTransactionSpy.mockReturnValue(
      Promise.resolve(initialTransactionFetchResponseBody.transactions[0])
    );

    // Process first set of transactions.
    const observer = new Observer(
      versionManager,
      blockchainClient,
      config.maxConcurrentDownloads,
      operationStore,
      transactionStore,
      transactionStore,
      1
    );

    // mocking throughput limiter to make testing easier
    const transactionSpy = jest.spyOn(
      observer['throughputLimiter'],
      'getQualifiedTransactions'
    );
    transactionSpy.mockImplementation((transactions: TransactionModel[]) => {
      return new Promise((resolve) => {
        resolve(transactions);
      });
    });

    await observer.startPeriodicProcessing(); // Asynchronously triggers Observer to start processing transactions immediately.

    // Monitor the processed transactions list until the expected count or max retries is reached.
    const processedTransactions = transactionStore.getTransactions();
    await retry(
      async () => {
        const processedTransactionCount = processedTransactions.length;
        if (processedTransactionCount === 4) {
          return;
        }

        // NOTE: the `retry` library retries if error is thrown.
        throw new Error('Block reorganization not handled.');
      },
      {
        retries: 10,
        minTimeout: 1000, // milliseconds
        maxTimeout: 1000, // milliseconds
      }
    );

    expect(processedTransactions.length).toEqual(4);
    expect(processedTransactions[0].anchorString).toEqual('1stTransaction');
    expect(processedTransactions[1].anchorString).toEqual('2ndTransactionNew');
    expect(processedTransactions[2].anchorString).toEqual('3rdTransactionNew');
    expect(processedTransactions[3].anchorString).toEqual('4thTransaction');
  });

  it('should not rollback if blockchain time in bitcoin service is behind core service.', async () => {
    const anchoredData = AnchoredDataSerializer.serialize({
      anchorFileHash: '1stTransaction',
      numberOfOperations: 1,
    });
    const transaction = {
      transactionNumber: 1,
      transactionTime: 1000,
      transactionHash: 'hash',
      transactionTimeHash: '1000',
      anchorString: anchoredData,
      transactionFeePaid: 1,
      normalizedTransactionFee: 1,
      writer: 'writer',
    };

    // Prep the transaction store with some initial state.
    await transactionStore.addTransaction(transaction);

    const blockchainClient = new MockLedger();

    // Always return a blockchain time less than the last transaction known by core to simulate blockchain service being behind core service.
    const timeSpy = jest.spyOn(blockchainClient, 'getLatestTime');
    timeSpy.mockReturnValue(Promise.resolve({ time: 500, hash: '500' }));

    // Simulate the read response when blockchain service blockchain time is behind core service's.
    let readInvocationCount = 0;
    const mockReadFunction = async (
      sinceTransactionNumber?: number,
      transactionTimeHash?: string
    ): Promise<{
      moreTransactions: boolean;
      transactions: TransactionModel[];
    }> => {
      readInvocationCount++;
      expect(sinceTransactionNumber).toEqual(2);
      expect(transactionTimeHash).toEqual('1000');
      throw new SidetreeError(
        SharedErrorCode.InvalidTransactionNumberOrTimeHash
      );
    };
    const readSpy = jest.spyOn(blockchainClient, 'read');
    readSpy.mockImplementation(mockReadFunction);

    // NOTE: it is irrelvant what getFirstValidTransaction() returns because it is expected to be not called at all.
    const getFirstValidTransactionSpy = jest.spyOn(
      blockchainClient,
      'getFirstValidTransaction'
    );
    getFirstValidTransactionSpy.mockReturnValue(Promise.resolve(undefined));

    // Process first set of transactions.
    const observer = new Observer(
      versionManager,
      blockchainClient,
      config.maxConcurrentDownloads,
      operationStore,
      transactionStore,
      transactionStore,
      1
    );

    const revertInvalidTransactionsSpy = jest.spyOn(
      observer as any,
      'revertInvalidTransactions'
    );
    revertInvalidTransactionsSpy.mockReturnValue(Promise.resolve(undefined));

    await observer.startPeriodicProcessing(); // Asynchronously triggers Observer to start processing transactions immediately.

    // Monitor the Observer until at two processing cycle has lapsed.
    await retry(
      async () => {
        if (readInvocationCount >= 2) {
          return;
        }

        // NOTE: the `retry` library retries if error is thrown.
        throw new Error(
          'Two transaction processing cycles have not occured yet.'
        );
      },
      {
        retries: 3,
        minTimeout: 1000, // milliseconds
        maxTimeout: 1000, // milliseconds
      }
    );

    expect(revertInvalidTransactionsSpy).toHaveBeenCalledTimes(0);
    expect(getFirstValidTransactionSpy).toHaveBeenCalledTimes(0);
  });
});
