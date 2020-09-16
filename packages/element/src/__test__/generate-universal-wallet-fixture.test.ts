import { sidetreeUniversalWallet } from '@sidetree/test-vectors';

import Element from '../Element';

import { getTestElement, resetDatabase, writeFixture } from '../test/utils';

import { walletResolution } from '../__fixtures__';

console.info = () => null;

const { walletOperation } = sidetreeUniversalWallet;

let element: Element;

const WRITE_FIXTURE_TO_DISK = false;

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

it('can generate test fixture', async () => {
  const fixture: any = {
    resolution: [],
  };
  await Promise.all(
    [walletOperation.operation[0]].map(async (opFixture: any) => {
      let response = await element.handleResolveRequest(
        opFixture.createOperationWalletDidDoc.id
      );
      // assert long form matches what wallet creates.
      expect(response.body.didDocument).toEqual(
        opFixture.createOperationWalletDidDoc.didDocument
      );
      response = await element.handleOperationRequest(
        Buffer.from(JSON.stringify(opFixture.createOperation))
      );
      const did = response.body.didDocument.id;
      await element.triggerBatchAndObserve();
      const afterCreate = await element.handleResolveRequest(did);
      // assert short form matches what wallet creates.
      expect(response.body.didDocument).toEqual(
        opFixture.createOperationWalletDidDoc.didDocument
      );
      response = await element.handleOperationRequest(
        Buffer.from(JSON.stringify(opFixture.recoverOperation))
      );
      await element.triggerBatchAndObserve();
      const afterRecover = await element.handleResolveRequest(did);

      fixture.resolution.push({
        afterCreate,
        afterRecover,
      });
    })
  );

  // uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  expect(fixture).toEqual(walletResolution);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-resolution.json', fixture);
  }
});
