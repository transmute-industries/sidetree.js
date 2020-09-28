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

import { getCreateOperation } from './getCreateOperation';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0
  );
  expect(createOperation).toEqual(
    fixtures.walletOperation.operation[0].createOperation
  );
});

it('can get create operation with service endpoints', async () => {
  const createOperationWithPatch = await getCreateOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    {
      service_endpoints: [
        {
          id: 'resolver-0',
          type: 'Resolver',
          endpoint: 'https://example.com',
        },
      ],
    }
  );
  expect(createOperationWithPatch).toEqual(
    fixtures.walletOperation.operation[0].createOperationWithPatch
  );
});
