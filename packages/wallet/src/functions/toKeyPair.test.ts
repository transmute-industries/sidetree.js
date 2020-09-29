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

import { toKeyPair } from './toKeyPair';

import { walletKeyPair } from '../__fixtures__';

it('can generate key pair Ed25519', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'Ed25519'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].Ed25519);
});

it('can generate key pair X25519', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'X25519'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].X25519);
});

it('can generate key pair secp256k1', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'secp256k1'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].secp256k1);
});
