import Element from '../Element';
import {
  shortFormDid,
  createOperationBuffer,
  resolveBody,
  updateOperationBuffer,
} from './__fixtures__';
import { getTestElement } from './utils';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

it('should create a did', async () => {
  const createOperation = await element.handleOperationRequest(
    createOperationBuffer
  );
  expect(createOperation.status).toBe('succeeded');
  expect(createOperation.body).toEqual(resolveBody);
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  const resolveRequest = await element.handleResolveRequest(shortFormDid);
  expect(resolveRequest.body).toEqual(resolveBody);
});

it('should update a did', async () => {
  const updateOperation = await element.handleOperationRequest(
    updateOperationBuffer
  );
  expect(updateOperation.status).toBe('succeeded');
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const didUniqueSuffix = shortFormDid.split(':').pop();
  const ops = await element.operationStore.get(didUniqueSuffix!);
  expect(ops.length).toBe(2);
  const resolveRequest = await element.handleResolveRequest(shortFormDid);
  expect(resolveRequest.body.didDocument.publicKey[1].id).toBe(
    '#additional-key'
  );
});
