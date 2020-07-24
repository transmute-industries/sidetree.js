import { OperationGenerator } from '@sidetree/core';
import Element from '../Element';
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

it('should get versions', async () => {
  const versions = await element.handleGetVersionRequest();
  expect(versions.status).toBe('succeeded');
  expect(JSON.parse(versions.body)).toHaveLength(3);
});

it('sanity', async () => {
  const create = await OperationGenerator.generateCreateOperation();
  const update = await OperationGenerator.generateUpdateOperation(
    create.createOperation.didUniqueSuffix,
    create.updatePublicKey,
    create.updatePrivateKey
  );
  expect(create).toBeDefined();
  expect(update).toBeDefined();
  let operation = await element.handleOperationRequest(
    create.createOperation.operationBuffer
  );
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchAndObserve();
  let txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
  operation = await element.handleOperationRequest(
    update.updateOperation.operationBuffer
  );
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchAndObserve();
  txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const ops = await element.operationStore.get(
    create.createOperation.didUniqueSuffix
  );
  expect(ops.length).toBe(2);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
});
