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
import { getCreateOperationForProfile } from './getCreateOperationForProfile';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    'SVIP'
  );
  expect(createOperation).toEqual(
    walletSvipOperation.operation[0].createOperation
  );
});
