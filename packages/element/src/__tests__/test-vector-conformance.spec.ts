import Element from '../Element';
import { testVectors } from '../__fixtures__';
import { getTestElement } from '../test/utils';

console.info = () => null;

let element: Element;

beforeEach(async () => {
  element = await getTestElement();
});

afterEach(async () => {
  await element.close();
});

const replaceMethod = (
  operation: any,
  defaultMethod: string = 'sidetree',
  specificMethod: string = 'elem'
) => {
  // prevent mutation
  const _op = JSON.parse(JSON.stringify(operation));
  _op.body.didDocument.id = _op.body.didDocument.id.replace(
    specificMethod,
    defaultMethod
  );
  _op.body.didDocument['@context'][1]['@base'] = _op.body.didDocument[
    '@context'
  ][1]['@base'].replace(specificMethod, defaultMethod);
  return _op;
};

it('create', async () => {
  const operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.create.createRequest))
  );
  expect(replaceMethod(operation).body).toEqual(
    testVectors.create.createResponse
  );
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(
    operation.body.didDocument.id
  );
  expect(replaceMethod(resolveRequest).body).toEqual(
    testVectors.create.createResponse
  );
});

it('update', async () => {
  let operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.update.createRequest))
  );
  let did = operation.body.didDocument.id;
  await element.triggerBatchAndObserve();
  operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.update.updateRequest))
  );
  expect(operation).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);
  expect(replaceMethod(resolveRequest).body).toEqual(
    testVectors.update.updateResponse
  );
});

it('recover', async () => {
  let operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.recover.createRequest))
  );
  let did = operation.body.didDocument.id;
  await element.triggerBatchAndObserve();
  operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.recover.recoverRequest))
  );
  expect(operation).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);
  expect(replaceMethod(resolveRequest).body).toEqual(
    testVectors.recover.recoverResponse
  );
});

it('deactivate', async () => {
  let operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.deactivate.createRequest))
  );
  let did = operation.body.didDocument.id;
  await element.triggerBatchAndObserve();
  operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(testVectors.deactivate.deactivateRequest))
  );
  expect(operation).toEqual({ status: 'succeeded' });
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  const resolveRequest = await element.handleResolveRequest(did);
  expect(resolveRequest.body).toEqual(
    testVectors.deactivate.deactivateResponse
  );
});
