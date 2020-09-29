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

import { KeyGenerator } from './KeyGenerator';

export const generateKeyFixtures = async () => {
  const keyGenerator = new KeyGenerator();
  const k0 = await keyGenerator.getKeyPair();
  const k1 = await keyGenerator.getKeyPair('secp256k1');
  const k2 = await keyGenerator.getKeyPair();
  const k3 = await keyGenerator.getKeyPair('ed25519');

  const keypair = {
    mnemonic: keyGenerator.mnemonic,
    keypair: [k0, k1, k2, k3],
  };

  return JSON.parse(JSON.stringify(keypair));
};
