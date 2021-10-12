import vectors from '@sidetree/test-vectors';
import Core from '../Core';

import {
  waitSeconds,
  getTestSidetreeNodeInstance,
  clearCollection,
} from '../__fixtures__/help';

let did: any;
let sidetreeNodeInstance: Core;

jest.setTimeout(60 * 1000);

beforeAll(async () => {
  sidetreeNodeInstance = await getTestSidetreeNodeInstance();
  await clearCollection('service');
  await clearCollection('operations');
  await clearCollection('transactions');
  await clearCollection('queued-operations');
});

afterAll(async () => {
  await sidetreeNodeInstance.shutdown();
});

it('can resolve a long form did', async () => {
  const { longFormDid } = vectors.didMethod.operations.create;
  const result = await sidetreeNodeInstance.handleResolveRequest(longFormDid);
  expect(result.body.didDocument.id).toEqual(longFormDid);
});

it('can submit create operation and resolve', async () => {
  const { operation, resolve } = vectors.didMethod.operations.create;
  const result1 = await sidetreeNodeInstance.handleOperationRequest(
    Buffer.from(JSON.stringify(operation))
  );
  did = result1.body.didDocument.id;
  await waitSeconds(5);
  const result2 = await sidetreeNodeInstance.handleResolveRequest(did);
  expect(result2).toEqual(resolve);
});

it('can submit update operation and resolve', async () => {
  const { operation, resolve } = vectors.didMethod.operations.update;
  const result1 = await sidetreeNodeInstance.handleOperationRequest(
    Buffer.from(JSON.stringify(operation))
  );
  expect(result1.status).toBe('succeeded');
  await waitSeconds(5);
  const result2 = await sidetreeNodeInstance.handleResolveRequest(did);
  expect(result2).toEqual(resolve);
});

it('can submit recover operation and resolve', async () => {
  const { operation, resolve } = vectors.didMethod.operations.recover;
  const result1 = await sidetreeNodeInstance.handleOperationRequest(
    Buffer.from(JSON.stringify(operation))
  );
  expect(result1.status).toBe('succeeded');
  await waitSeconds(5);
  const result2 = await sidetreeNodeInstance.handleResolveRequest(did);
  expect(result2).toEqual(resolve);
});

it('can submit deactivate operation and resolve', async () => {
  const { operation, resolve } = vectors.didMethod.operations.deactivate;
  const result1 = await sidetreeNodeInstance.handleOperationRequest(
    Buffer.from(JSON.stringify(operation))
  );
  expect(result1.status).toBe('succeeded');
  await waitSeconds(5);
  const result2 = await sidetreeNodeInstance.handleResolveRequest(did);
  expect(result2).toEqual(resolve);
});
