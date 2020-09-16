import { sidetreeUniversalWallet } from '@sidetree/test-vectors';

import Element from '../Element';

import { getTestElement, resetDatabase } from '../test/utils';

console.info = () => null;

const { walletOperation } = sidetreeUniversalWallet;

let element: Element;

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

it('can generate test fixture', async () => {
  const fixture: any = {
    // sidetreeUniversalWallet,
  };
  await Promise.all(
    [walletOperation.operation[0]].map(async (opFixture: any) => {
      let response = await element.handleOperationRequest(
        Buffer.from(JSON.stringify(opFixture.createOperation))
      );
      await element.triggerBatchAndObserve();
      const did = response.body.didDocument.id;
      response = await element.handleResolveRequest(did);
      expect(response.body.didDocument).toEqual(
        opFixture.createOperationWalletDidDoc.didDocument
      );
    })
  );
  console.log(JSON.stringify(fixture, null, 2));
});
