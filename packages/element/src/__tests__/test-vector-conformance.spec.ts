import Element from '../Element';
import { testVectors } from '@sidetree/test-vectors';
import { getTestElement, replaceMethod } from '../test/utils';

console.info = () => null;

let element: Element;

beforeEach(async () => {
  element = await getTestElement();
});

afterEach(async () => {
  await element.close();
});

it('create', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.create.createRequest))
  );
  expect(replaceMethod(response.body)).toEqual(
    testVectors.create.createResponse
  );
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(
    response.body.didDocument.id
  );
  expect(replaceMethod(resolveRequest.body)).toEqual(
    testVectors.create.createResponse
  );
});

it('update', async () => {
  let response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.update.createRequest))
  );
  const did = response.body.didDocument.id;
  await element.triggerBatchAndObserve();
  response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.update.updateRequest))
  );
  expect(response).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  response = await element.handleResolveRequest(did);
  expect(replaceMethod(response.body)).toEqual(
    testVectors.update.updateResponse
  );
});

it('recover', async () => {
  let response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.recover.createRequest))
  );
  const did = response.body.didDocument.id;
  await element.triggerBatchAndObserve();
  response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.recover.recoverRequest))
  );
  expect(response).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  response = await element.handleResolveRequest(did);
  expect(replaceMethod(response.body)).toEqual(
    testVectors.recover.recoverResponse
  );
});

it('deactivate', async () => {
  let response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.deactivate.createRequest))
  );
  const did = response.body.didDocument.id;
  await element.triggerBatchAndObserve();
  response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.deactivate.deactivateRequest))
  );
  expect(response).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  response = await element.handleResolveRequest(did);
  expect(response.body).toEqual(testVectors.deactivate.deactivateResponse);
});
