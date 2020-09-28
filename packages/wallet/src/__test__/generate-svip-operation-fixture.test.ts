/*
 * Copyright 2020 - Transmute Industries Inc.
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

import { crypto } from '@sidetree/test-vectors';

import { writeFixture } from '../test/util';
import { getCreateOperationForProfile } from '../functions/getCreateOperationForProfile';
import { getRecoverOperationForProfile } from '../functions/getRecoverOperationForProfile';
import { toDidDocForProfile } from '../functions/toDidDocForProfile';

import { walletSvipOperation } from '../__fixtures__';

const WRITE_FIXTURE_TO_DISK = false;

const profile = 'SVIP';

jest.setTimeout(10 * 1000);

it('can generate test fixture', async () => {
  const fixture: any = {
    operation: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];
    const createOperation = await getCreateOperationForProfile(
      mnemonic,
      0,
      profile
    );

    const createPatch = {
      service_endpoints: [
        {
          id: 'resolver-0',
          type: 'Resolver',
          endpoint: 'https://example.com',
        },
      ],
    };
    const createOperationWithPatch = await getCreateOperationForProfile(
      mnemonic,
      0,
      profile,
      createPatch
    );

    const createOperationWalletDidDoc = await toDidDocForProfile(
      mnemonic,
      0,
      'elem',
      profile
    );

    const createOperationWithPatchWalletDidDoc = await toDidDocForProfile(
      mnemonic,
      0,
      'elem',
      profile,
      createPatch
    );

    const didUniqueSuffix = (createOperationWalletDidDoc.didDocument as any).id
      .split(':')
      .pop();

    const didUniqueSuffixWithPatch = (createOperationWithPatchWalletDidDoc.didDocument as any).id
      .split(':')
      .pop();

    const recoverOperation = await getRecoverOperationForProfile(
      mnemonic,
      0,
      didUniqueSuffix,
      profile
    );

    const recoverOperationWithPatch = await getRecoverOperationForProfile(
      mnemonic,
      0,
      didUniqueSuffixWithPatch,
      profile,
      {
        service_endpoints: [
          {
            id: 'resolver-1',
            type: 'Resolver',
            endpoint: 'https://example.com',
          },
        ],
      }
    );

    const recoverOperationWithPatch2 = await getRecoverOperationForProfile(
      mnemonic,
      1,
      didUniqueSuffixWithPatch,
      profile,
      {
        service_endpoints: [
          {
            id: 'resolver-2',
            type: 'Resolver',
            endpoint: 'https://example.com',
          },
        ],
      }
    );

    fixture.operation.push({
      mnemonic,
      //create without services
      createOperation,
      createOperationWalletDidDoc,

      // create with services
      createOperationWithPatch,
      createOperationWithPatchWalletDidDoc,

      //recover without services
      recoverOperation,

      // recover with services
      recoverOperationWithPatch,
      recoverOperationWithPatch2,
    });
  }

  // uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));
  expect(fixture).toEqual(walletSvipOperation);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-svip-operation.json', fixture);
  }
});
