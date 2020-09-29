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

import { walletSvipOperation } from '../__fixtures__';

import { getRecoverOperationForProfile } from './getRecoverOperationForProfile';

it('can get recover operation from mnemonic', async () => {
  const didUniqueSuffix = (walletSvipOperation.operation[0]
    .createOperationWalletDidDoc.didDocument as any).id
    .split(':')
    .pop();
  const recoverOperation = await getRecoverOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    didUniqueSuffix
  );
  expect(recoverOperation).toEqual(
    walletSvipOperation.operation[0].recoverOperation
  );
});

it('can get recover operation from mnemonic with service', async () => {
  const didUniqueSuffix = (walletSvipOperation.operation[0]
    .createOperationWithPatchWalletDidDoc.didDocument as any).id
    .split(':')
    .pop();
  const recoverOperation = await getRecoverOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    didUniqueSuffix,
    'SVIP',
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
  expect(recoverOperation).toEqual(
    walletSvipOperation.operation[0].recoverOperationWithPatch
  );
});
