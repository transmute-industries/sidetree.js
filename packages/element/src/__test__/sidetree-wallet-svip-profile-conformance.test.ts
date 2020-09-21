import Element from '../Element';

import {
  getTestElement,
  resetDatabase,
  // writeFixture
} from '../test/utils';

import { sidetreeUniversalWallet } from '@sidetree/test-vectors';

const { walletSvipOperation } = sidetreeUniversalWallet;

console.info = () => null;

let element: Element;

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
});
