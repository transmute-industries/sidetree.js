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

import { toMnemonic } from './toMnemonic';

import { walletMnemonic } from '../__fixtures__';

it('can generate a mnemonic', async () => {
  const content = await toMnemonic();
  expect(content.type).toBe(walletMnemonic.mnemonic[0].content.type);
  expect(content.name).toBe(walletMnemonic.mnemonic[0].content.name);
  expect(content.image).toBe(walletMnemonic.mnemonic[0].content.image);
  expect(content.description).toBe(
    walletMnemonic.mnemonic[0].content.description
  );
});

it('can generate a mnemonic from a value', async () => {
  const content = await toMnemonic(walletMnemonic.mnemonic[0].mnemonic);
  expect(content).toEqual(walletMnemonic.mnemonic[0].content);
});
