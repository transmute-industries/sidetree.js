import Element from '../Element';

import { sidetreeCoreGeneratedEd25519Resolutions } from '../__fixtures__';
import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';

import { getTestElement } from '../test/utils';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

const operationFixture = sidetreeCoreGeneratedEd25519.operation.operation;

let did: any;
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
