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
import { MongoDbOperationQueue } from '@sidetree/db';
import { getTestPhoton } from './utils';
import Photon from '../Photon';
import AWS from 'aws-sdk/global';

const awsConfig = new AWS.Config();
if (!awsConfig.credentials) {
  console.warn(
    'No AWS credentials found in ~/.aws/credentials, skipping Photon tests...'
  );
  // eslint-disable-next-line no-global-assign
  describe = describe.skip;
}

console.info = (): null => null;

jest.setTimeout(30 * 1000);

describe('Photon', () => {
  let photon: Photon;
  let operationQueue: MongoDbOperationQueue;

  beforeAll(async () => {
    photon = await getTestPhoton();
    const { versionManager } = photon as any;
    operationQueue = versionManager.getOperationQueue(
      photon.blockchain.approximateTime.time
    );
  });

  afterAll(async () => {
    await photon.close();
  });

  const batchSize = 10;
  const batch: any[] = [];
  const didDocuments: any = {};

  it(`should generate a batch of ${batchSize} credentials`, async () => {
    const mnemonic = crypto.mnemonic.mnemonic[0];
    for (let i = 0; i < batchSize; i++) {
      const createOperation = await methods.getCreateOperationForProfile(
        mnemonic,
        i
      );
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
