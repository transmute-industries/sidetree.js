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
  AnchoredOperationModel,
  Config,
  CoreErrorCode as ErrorCode,
  IBlockchain,
  ICas,
  IOperationStore,
  ITransactionStore,
  OperationType,
  ProtocolVersionModel,
  TransactionModel,
} from '@sidetree/common';
import DownloadManager from '../DownloadManager';
import { MockLedger as MockBlockchain } from '@sidetree/ledger';
import { MockCas } from '@sidetree/cas';
import MockOperationStore from './mocks/MockOperationStore';
import MockTransactionStore from './mocks/MockTransactionStore';
import Resolver from '../Resolver';
import VersionManager from '../VersionManager';

// eslint-disable-next-line @typescript-eslint/no-empty-function
console.debug = () => {};

describe('VersionManager', () => {
  let config: Config;
  let blockChain: IBlockchain;
  let cas: ICas;
  let operationStore: IOperationStore;
  let downloadMgr: DownloadManager;
  let mockTransactionStore: ITransactionStore;

  beforeEach(() => {
    config = require('./config-test.json');
    blockChain = new MockBlockchain();
    cas = new MockCas();
    operationStore = new MockOperationStore();
    downloadMgr = new DownloadManager(1, cas);
    mockTransactionStore = new MockTransactionStore();
  });

  describe('initialize()', () => {
    it('should initialize all the objects correctly.', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'test-version-1' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      spyOn(versionMgr as any, 'loadDefaultExportsForVersion').and.callFake(
        async (version: string, className: string) => {
          return (await import(`./versions/${version}/${className}`)).default;
        }
      );

      const resolver = new Resolver(versionMgr, operationStore);
      await versionMgr.initialize(
        blockChain,
        cas,
        downloadMgr,
        operationStore,
        resolver,
        mockTransactionStore
      );
      expect(
        versionMgr['batchWriters'].get(
          'test-version-1'
        ) as any['versionMetadataFetcher']
      ).toBeDefined();
      expect(
        versionMgr['transactionProcessors'].get(
          'test-version-1'
        ) as any['versionMetadataFetcher']
      ).toBeDefined();

      // No exception thrown == initialize was successful
    });

    it('should throw if version metadata is the wrong type.', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'test-version-1' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      spyOn(versionMgr as any, 'loadDefaultExportsForVersion').and.callFake(
        async (version: string, className: string) => {
          if (className === 'VersionMetadata') {
            const FakeClass = class {}; // a fake class that does nothing
            return FakeClass;
          } else {
            return (await import(`./versions/${version}/${className}`)).default;
          }
        }
      );

      const resolver = new Resolver(versionMgr, operationStore);

      try {
        await versionMgr.initialize(
          blockChain,
          cas,
          downloadMgr,
          operationStore,
          resolver,
          mockTransactionStore
        );
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.code).toEqual(
          ErrorCode.VersionManagerVersionMetadataIncorrectType
        );
      }
    });

    it('should throw if the versions folder is missing.', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'invalid_version' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      const resolver = new Resolver(versionMgr, operationStore);
      try {
        await versionMgr.initialize(
          blockChain,
          cas,
          downloadMgr,
          operationStore,
          resolver,
          mockTransactionStore
        );
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.code).toBe('MODULE_NOT_FOUND');
      }
    });
  });

  describe('getVersionMetadata', () => {
    it('should return the expected versionMetadata', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'test-version-1' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      spyOn(versionMgr as any, 'loadDefaultExportsForVersion').and.callFake(
        async (version: string, className: string) => {
          return (await import(`./versions/${version}/${className}`)).default;
        }
      );

      const resolver = new Resolver(versionMgr, operationStore);
      await versionMgr.initialize(
        blockChain,
        cas,
        downloadMgr,
        operationStore,
        resolver,
        mockTransactionStore
      );

      const result = versionMgr.getVersionMetadata(1001);
      expect(result.hashAlgorithmInMultihashCode).toEqual(18);
      expect(result.normalizedFeeToPerOperationFeeMultiplier).toEqual(0.01);
    });
  });

  describe('get* functions.', () => {
    it('should return the correct version-ed objects for valid version.', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'test-version-1' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      spyOn(versionMgr as any, 'loadDefaultExportsForVersion').and.callFake(
        async (version: string, className: string) => {
          return (await import(`./versions/${version}/${className}`)).default;
        }
      );

      const resolver = new Resolver(versionMgr, operationStore);

      await versionMgr.initialize(
        blockChain,
        cas,
        downloadMgr,
        operationStore,
        resolver,
        mockTransactionStore
      );

      // Get the objects for the valid version (see versions/testingversion1 folder) and call
      // functions on the objects to make sure that the correct objects are being returned.
      // For testing, the functions in the above testingversion folder are throwing errors so
      // that is way that we can tell that the correct object is actually being returned.
      const batchWriter = versionMgr.getBatchWriter(1000);
      try {
        await batchWriter.write();
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.message).toContain('Not implemented');
      }

      const operationProcessor = versionMgr.getOperationProcessor(1001);
      const namedAnchoredOpModel: AnchoredOperationModel = {
        type: OperationType.Create,
        didUniqueSuffix: 'unusedDidUniqueSuffix',
        transactionTime: 0,
        transactionNumber: 0,
        operationIndex: 0,
        operationBuffer: Buffer.from(''),
      };
      try {
        await operationProcessor.apply(namedAnchoredOpModel, undefined);
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.message).toContain('Not implemented');
      }

      const requestHandler = versionMgr.getRequestHandler(2000);

      try {
        await requestHandler.handleResolveRequest('');
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.message).toContain('Not implemented');
      }

      const txProcessor = versionMgr.getTransactionProcessor(10000);
      const txModel: TransactionModel = {
        anchorString: '',
        transactionNumber: 0,
        transactionTime: 0,
        transactionHash: 'hash',
        transactionTimeHash: '',
        transactionFeePaid: 1,
        normalizedTransactionFee: 1,
        writer: 'writer',
      };

      try {
        await txProcessor.processTransaction(txModel);
        fail('expect to throw but did not');
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e.message).toContain('Not implemented');
      }
    });

    it('should throw for an invalid version.', async () => {
      const protocolVersionConfig: ProtocolVersionModel[] = [
        { startingBlockchainTime: 1000, version: 'test-version-1' },
      ];

      const versionMgr = new VersionManager(config, protocolVersionConfig);
      spyOn(versionMgr as any, 'loadDefaultExportsForVersion').and.callFake(
        async (version: string, className: string) => {
          return (await import(`./versions/${version}/${className}`)).default;
        }
      );

      const resolver = new Resolver(versionMgr, operationStore);

      await versionMgr.initialize(
        blockChain,
        cas,
        downloadMgr,
        operationStore,
        resolver,
        mockTransactionStore
      );

      // Expect an invalid blockchain time input to throw
      expect(() => {
        versionMgr.getBatchWriter(0);
      }).toThrowError();
      expect(() => {
        versionMgr.getOperationProcessor(999);
      }).toThrowError();
      expect(() => {
        versionMgr.getRequestHandler(100);
      }).toThrowError();
      expect(() => {
        versionMgr.getTransactionProcessor(500);
      }).toThrowError();
    });
  });
});
