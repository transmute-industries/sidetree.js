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

import { methods } from '@sidetree/wallet';
import { crypto } from '@sidetree/test-vectors';
import { getTestPhoton } from './utils';
import Photon from '../Photon';
import AWS from 'aws-sdk/global';
import { IOperationQueue, PublicKeyPurpose } from '@sidetree/common';

const awsConfig = new AWS.Config();
if (!awsConfig.credentials) {
  console.warn(
    'No AWS credentials found in ~/.aws/credentials, skipping Photon tests...'
  );
  // eslint-disable-next-line no-global-assign
  describe = describe.skip;
}

console.info = (): null => null;

jest.setTimeout(10 * 1000);

describe('Test Batching', () => {
  let photon: Photon;
  let operationQueue: IOperationQueue;

  beforeAll(async () => {
    photon = await getTestPhoton();
    const { versionManager } = photon;
    operationQueue = versionManager.getOperationQueue(
      photon.blockchain.approximateTime.time
    );
  });

  afterAll(async () => {
    await photon.close();
  });

  const generateCreateOperation = async (publicKey: any): Promise<any> => {
    // We could generate the create operation like this
    /*
    const mnemonic = crypto.mnemonic.mnemonic[0];
    const createOperation = await methods.getCreateOperationForProfile(
      mnemonic,
      i
    );
    */
    // However this is too slow because it generates new keys for every create
    // operation which cause the tests to timeout for batch size larger than 1000

    // Therefore for the purpose of showing the we can process large batches
    // we will generate create operation for did documents that share the same key
    const documentModel = {
      public_keys: [
        {
          // id is random so that each id (and therefore each did) is different
          id: Math.random(),
          type: 'JsonWebKey2020',
          jwk: publicKey,
          purpose: [PublicKeyPurpose.General],
        },
      ],
    };
    const createOperation = await methods.getCreatePayloadFromDocumentModel(
      documentModel,
      publicKey,
      publicKey
    );
    return createOperation;
  };

  const runBatchingTestWithSize = (batchSize: number): void => {
    describe(`Batch size: ${batchSize}`, () => {
      const batch: any[] = [];
      const didDocuments: any = {};

      it('should generate a batch of credentials', async () => {
        const mnemonic = crypto.mnemonic.mnemonic[0];
        const keyPair = await methods.toKeyPair(mnemonic, 0, 'Ed25519');
        const publicKey = keyPair.publicKeyJwk;

        for (let i = 0; i < batchSize; i++) {
          const createOperation = await generateCreateOperation(publicKey);
          batch.push(createOperation);
        }
        expect(batch).toHaveLength(batchSize);
      });

      it('should submit these operations to the queue', async () => {
        for (let i = 0; i < batchSize; i++) {
          const operation = await photon.handleOperationRequest(
            Buffer.from(JSON.stringify(batch[i]))
          );
          expect(operation.status).toBe('succeeded');
          expect(operation.body).toBeDefined();
          const { didDocument } = operation.body;
          expect(didDocument).toBeDefined();
          expect(didDocument.id).toBeDefined();
          didDocuments[didDocument.id] = didDocument;
        }
        const queue = await operationQueue.peek(batchSize + 1);
        expect(queue).toHaveLength(batchSize);
      });

      it('should create a batch', async () => {
        await photon.triggerBatchWriting();
        const queue = await operationQueue.peek(batchSize + 1);
        expect(queue).toHaveLength(0);
      });

      it('should trigger the observer', async () => {
        await photon.triggerProcessTransactions();
      });

      it('should resolve the created DIDs', async () => {
        const dids = Object.keys(didDocuments);
        for (let i = 0; i < batchSize; i++) {
          const did = dids[i];
          const resolveResponse = await photon.handleResolveRequest(did);
          expect(resolveResponse.status).toBe('succeeded');
          expect(resolveResponse.body.didDocument).toEqual(didDocuments[did]);
        }
      });
    });
  };

  runBatchingTestWithSize(1);
  runBatchingTestWithSize(10);
  runBatchingTestWithSize(100);
  runBatchingTestWithSize(1000);
  // Running a batch of size 10000 works but is slow
  // Uncomment and increase the jest.setTimeout value to 100 * 1000 to find out
  // runBatchingTestWithSize(10000);
});
