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
import { sidetreeCoreGeneratedEd25519Resolutions } from '../__fixtures__';
import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';
import { getTestElement } from '../test/utils';

console.info = (): null => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

const operationFixture = sidetreeCoreGeneratedEd25519.operation.operation;

let did: any;
jest.setTimeout(60 * 1000);

it('can create and resolve', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[0].request))
  );
  expect(response.body).toEqual(operationFixture[0].response);
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  // consider further fixtures tests here.
  did = response.body.didDocument.id;
  const resolveRequest = await element.handleResolveRequest(did);
  expect(resolveRequest.body).toEqual(operationFixture[0].response);
});

it('can update and resolve', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[1].request))
  );
  expect(response).toEqual({
    status: 'succeeded',
  });

  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);

  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[0]
  );
});

it('can recover and resolve', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[2].request))
  );
  expect(response).toEqual({
    status: 'succeeded',
  });

  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(3);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);

  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[1]
  );
});

it('can deactivate and resolve', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[3].request))
  );
  expect(response).toEqual({
    status: 'succeeded',
  });

  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(4);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);
  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[2]
  );
});
