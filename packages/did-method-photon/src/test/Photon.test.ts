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

import QLDBLedger from '@sidetree/qldb';
import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';
import { resetDatabase, getTestLedger, replaceMethod } from './utils';
import Photon from '../Photon';
import config from './photon-config.json';
import AWS from 'aws-sdk';

const awsConfig = new AWS.Config();
if (!awsConfig.credentials) {
  console.warn(
    'No AWS credentials found in ~/.aws/credentials, skipping Photon tests...'
  );
  // eslint-disable-next-line no-global-assign
  describe = describe.skip;
}

const create = sidetreeCoreGeneratedEd25519.operation.operation[0];
const {
  shortFormDid: elemShortFormDid,
  request: createOperation,
  response: elemResolveBody,
} = create;

const shortFormDid = elemShortFormDid.replace('elem', 'photon');
const resolveBody = replaceMethod(elemResolveBody);
const createOperationBuffer = Buffer.from(JSON.stringify(createOperation));

console.info = (): null => null;

jest.setTimeout(60 * 1000);

describe('Photon', () => {
  let ledger: QLDBLedger;
  let photon: Photon;

  beforeAll(async () => {
    await resetDatabase();
    ledger = await getTestLedger();
    await ledger.reset();
  });

  afterAll(async () => {
    await photon.close();
  });

  it('should create the Photon class', async () => {
    photon = new Photon(config, config.versions, ledger);
    expect(photon).toBeDefined();
  });

  it('should initialize the photon class', async () => {
    await photon.initialize(false, false);
  });

  it('should get versions', async () => {
    const versions = await photon.handleGetVersionRequest();
    expect(versions.status).toBe('succeeded');
    expect(JSON.parse(versions.body)).toHaveLength(3);
  });

  it('should handle operation request', async () => {
    const operation = await photon.handleOperationRequest(
      createOperationBuffer
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });

  it('should resolve a did after Observer has picked up the transaction', async () => {
    await photon.triggerBatchAndObserve();
    const operation = await photon.handleResolveRequest(
      shortFormDid.replace('elem', 'photon')
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });
});
