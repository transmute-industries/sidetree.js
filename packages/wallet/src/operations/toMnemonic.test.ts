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

import { wallet } from '@sidetree/test-vectors';

it('can generate a mnemonic', async () => {
  const content = await toMnemonic();
  expect(content.type).toBe(wallet.mnemonic[0].content.type);
  expect(content.name).toBe(wallet.mnemonic[0].content.name);
  expect(content.image).toBe(wallet.mnemonic[0].content.image);
  expect(content.description).toBe(wallet.mnemonic[0].content.description);
});

it('can generate a mnemonic from a value', async () => {
  const content = await toMnemonic(wallet.mnemonic[0].mnemonic);
  expect(content).toEqual(wallet.mnemonic[0].content);
});
