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

import * as fixtures from '../__fixtures__';

import { getRecoverOperation } from './getRecoverOperation';

it('can get recover operation from mnemonic', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    (fixtures.walletOperation.operation[0].createOperationWalletDidDoc
      .didDocument as any).id
      .split(':')
      .pop()
  );

  expect(recoverOperation).toEqual(
    fixtures.walletOperation.operation[0].recoverOperation
  );
});

it('can get recover operation from mnemonic with service', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    (fixtures.walletOperation.operation[0].createOperationWalletDidDoc
      .didDocument as any).id
      .split(':')
      .pop(),
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
    fixtures.walletOperation.operation[0].recoverOperationWithPatch
  );
});
