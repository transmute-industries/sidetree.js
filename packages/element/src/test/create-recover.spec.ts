import Element from '../Element';
import {
  shortFormDid,
  createOperationBuffer,
  resolveBody,
  recoverOperationBuffer,
} from './__fixtures__';
import { getTestElement } from './utils';

jest.setTimeout(20 * 1000);
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

it('should recover a did', async () => {
  const recoverOperation = await element.handleOperationRequest(
    recoverOperationBuffer
  );
  expect(recoverOperation.status).toBe('succeeded');
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const didUniqueSuffix = shortFormDid.split(':').pop();
  const ops = await element.operationStore.get(didUniqueSuffix!);
  expect(ops.length).toBe(2);
  const resolveRequest = await element.handleResolveRequest(shortFormDid);
  expect(resolveRequest.body.didDocument.publicKey[0].id).toBe('#newKey');
});
