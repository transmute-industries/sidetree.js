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

import Element from '../Element';
import { walletSvipResolutions } from '../__fixtures__';
import { getTestElement, resetDatabase, writeFixture } from '../test/utils';
import { sidetreeUniversalWallet } from '@sidetree/test-vectors';

const { walletSvipOperation } = sidetreeUniversalWallet;
const WRITE_FIXTURE_TO_DISK = false;
console.info = (): null => null;

let element: Element;
const fixture: any = {
  operation: [],
};

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

jest.setTimeout(60 * 1000);

let did: string;
it('can create Ed25519 / X25519 + service endpoints', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(
      JSON.stringify(walletSvipOperation.operation[0].createOperationWithPatch)
    )
  );
  expect(response.body.didDocument).toEqual(
    walletSvipOperation.operation[0].createOperationWithPatchWalletDidDoc
      .didDocument
  );
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  did = response.body.didDocument.id;
  const resolveRequest = await element.handleResolveRequest(did);

  expect(resolveRequest.body.didDocument).toEqual(
    walletSvipOperation.operation[0].createOperationWithPatchWalletDidDoc
      .didDocument
  );
  expect(resolveRequest.body.didDocument.service).toEqual([
    {
      id: '#resolver-0',
      type: 'Resolver',
      serviceEndpoint: 'https://example.com',
    },
  ]);
  fixture.operation.push({
    did,
    create: walletSvipOperation.operation[0].createOperationWithPatch,
    resolved: resolveRequest,
  });
});

it('can recover did document', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(
      JSON.stringify(walletSvipOperation.operation[0].recoverOperationWithPatch)
    )
  );
  expect(response).toEqual({
    status: 'succeeded',
  });

  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const resolveRequest = await element.handleResolveRequest(did);

  expect(resolveRequest.body.didDocument.service).toEqual([
    {
      id: '#resolver-1',
      type: 'Resolver',
      serviceEndpoint: 'https://example.com',
    },
  ]);

  fixture.operation.push({
    did,
    recover: walletSvipOperation.operation[0].recoverOperationWithPatch,
    resolved: resolveRequest,
  });
});

it('can recover did document again', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(
      JSON.stringify(
        walletSvipOperation.operation[0].recoverOperationWithPatch2
      )
    )
  );
  expect(response).toEqual({
    status: 'succeeded',
  });

  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(3);
  const resolveRequest = await element.handleResolveRequest(did);
  expect(resolveRequest.body.didDocument.service).toEqual([
    {
      id: '#resolver-2',
      type: 'Resolver',
      serviceEndpoint: 'https://example.com',
    },
  ]);
  fixture.operation.push({
    did,
    recover: walletSvipOperation.operation[0].recoverOperationWithPatch2,
    resolved: resolveRequest,
  });
});

it('write fixtures to disk', async () => {
  // uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));
  expect(fixture).toEqual(walletSvipResolutions);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-svip-resolution.json', fixture);
  }
});
