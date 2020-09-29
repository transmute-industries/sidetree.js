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
import { toMnemonic } from '../functions/toMnemonic';

import { walletMnemonic } from '../__fixtures__';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    mnemonic: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];
    const content = await toMnemonic(mnemonic);
    fixture.mnemonic.push({
      mnemonic,
      content,
    });
  }

  expect(fixture).toEqual(walletMnemonic);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-mnemonic.json', fixture);
  }
});
