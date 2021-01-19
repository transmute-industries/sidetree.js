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

import BatchWriter from '../../write/BatchWriter';
import { MockLedger } from '@sidetree/ledger';
import { MockCas } from '@sidetree/cas';
import MockOperationQueue from '../mocks/MockOperationQueue';
import {
  protocolParameters,
  IBlockchain,
  ICas,
  IOperationQueue,
  ValueTimeLockModel,
} from '@sidetree/common';
import OperationGenerator from '../generators/OperationGenerator';
import ValueTimeLockVerifier from '../../ValueTimeLockVerifier';
import ChunkFile from '../../write/ChunkFile';
import AnchorFile from '../../write/AnchorFile';

jest.setTimeout(10 * 1000);

console.info = (): null => null;

describe('BatchWriter', () => {
  let blockchain: IBlockchain;
  let cas: ICas;
  let operationQueue: IOperationQueue;
  let batchWriter: BatchWriter;

  beforeAll(() => {
    blockchain = new MockLedger();
    cas = new MockCas();
    operationQueue = new MockOperationQueue();
    const mockVersionMetadataFetcher: any = {};
    batchWriter = new BatchWriter(
      operationQueue,
      blockchain,
      cas,
      mockVersionMetadataFetcher
    );
  });

  describe('write()', () => {
    it('should return without writing anything if operation queue is emtpy.', async () => {
      const mockOpsByLock = protocolParameters.maxOperationsPerBatch;
      spyOn(blockchain, 'getFee').and.returnValue(Promise.resolve(100)); // Any fee, unused.
      spyOn(blockchain, 'getWriterValueTimeLock').and.returnValue(
        Promise.resolve(undefined)
      ); // Any value, unused.
      spyOn(batchWriter as any, 'getNumberOfOperationsAllowed').and.returnValue(
        mockOpsByLock
      );

      const chunkFileCreateBufferSpy = spyOn(ChunkFile, 'createBuffer');
      const casWriteSpy = spyOn(cas, 'write');
      const blockchainWriteSpy = spyOn(blockchain, 'write');

      await batchWriter.write();

      expect(chunkFileCreateBufferSpy).not.toHaveBeenCalled();
      expect(casWriteSpy).not.toHaveBeenCalled();
      expect(blockchainWriteSpy).not.toHaveBeenCalled();
    });

    it('should pass the writer lock ID to AnchoreFile.createBuffer() if a value lock exists.', async () => {
      spyOn(blockchain, 'getFee').and.returnValue(Promise.resolve(100));

      // Simulate a value lock fetched.
      const valueLock: ValueTimeLockModel = {
        amountLocked: 1,
        identifier: 'anIdentifier',
        lockTransactionTime: 2,
        normalizedFee: 3,
        owner: 'unusedOwner',
        unlockTransactionTime: 4,
      };
      spyOn(blockchain, 'getWriterValueTimeLock').and.returnValue(
        Promise.resolve(valueLock)
      );

      const mockOpsByLock = protocolParameters.maxOperationsPerBatch;
      spyOn(batchWriter as any, 'getNumberOfOperationsAllowed').and.returnValue(
        mockOpsByLock
      );

      // Simulate any operation in queue.
      const createOperationData = await OperationGenerator.generateCreateOperation();
      await operationQueue.enqueue(
        createOperationData.createOperation.didUniqueSuffix,
        createOperationData.createOperation.operationBuffer
      );

      const anchorFileCreateBufferSpy = spyOn(AnchorFile, 'createBuffer');
      anchorFileCreateBufferSpy.and.callFake(async (lockId) => {
        // This is the check for the test.
        expect(lockId).toEqual(valueLock.identifier);
        return Buffer.from('anyAnchorFileBuffer');
      });

      await batchWriter.write();
    });
  });

  describe('getNumberOfOperationsAllowed', () => {
    it('should return the value from the lock verifier', () => {
      const mockOpsByLock = protocolParameters.maxOperationsPerBatch - 1;
      spyOn(
        ValueTimeLockVerifier,
        'calculateMaxNumberOfOperationsAllowed'
      ).and.returnValue(mockOpsByLock);

      const actual = batchWriter['getNumberOfOperationsAllowed'](undefined);
      expect(actual).toEqual(mockOpsByLock);
    });

    it('should not return a value more than the max allowed batch size.', () => {
      const mockOpsByLock = protocolParameters.maxOperationsPerBatch + 123;
      spyOn(
        ValueTimeLockVerifier,
        'calculateMaxNumberOfOperationsAllowed'
      ).and.returnValue(mockOpsByLock);

      const actual = batchWriter['getNumberOfOperationsAllowed'](undefined);
      expect(actual).toEqual(protocolParameters.maxOperationsPerBatch);
    });
  });
});
