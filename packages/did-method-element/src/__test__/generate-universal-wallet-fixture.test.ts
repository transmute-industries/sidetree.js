/*
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { sidetreeUniversalWallet } from '@sidetree/test-vectors';
import Element from '../Element';
import { getTestElement, resetDatabase, writeFixture } from '../test/utils';
import { walletResolution } from '../__fixtures__';

console.info = (): null => null;

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

jest.setTimeout(60 * 1000);

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
