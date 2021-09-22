import vectors from '@sidetree/test-vectors';
import Core from '../Core';

import {
  waitSeconds,
  getTestSidetreeNodeInstance,
  clearCollection,
} from '../__fixtures__/help';

let sidetreeNodeInstance: Core;

jest.setTimeout(10 * 1000);

beforeAll(async () => {
  sidetreeNodeInstance = await getTestSidetreeNodeInstance();
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
  await waitSeconds(2);
  const result2 = await sidetreeNodeInstance.handleResolveRequest(
    result1.body.didDocument.id
  );
  expect(result2).toEqual(resolve);
});
