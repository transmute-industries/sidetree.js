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

  beforeAll(async () => {
    photon = await getTestPhoton();
  });

  afterAll(async () => {
    await photon.close();
  });

  const batchSize = 10;
  const batch: any[] = [];

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
    }
  });
});
