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

import { toKeyPair } from '../mnemonic';

import { mnemonic, keypair } from '../__fixtures__';
import { writeFixture } from '../test/util';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    keypair: [],
  };

  for (let i = 0; i < mnemonic.mnemonic.length; i++) {
    const m0 = mnemonic.mnemonic[i];
    const k0 = await toKeyPair(m0, 'Ed25519', "m/44'/1'/0'/0/0");
    const k1 = await toKeyPair(m0, 'X25519', "m/44'/1'/0'/0/0");
    const k2 = await toKeyPair(m0, 'secp256k1', "m/44'/1'/0'/0/0");

    expect(k0).toBeDefined();
    expect(k1).toBeDefined();
    expect(k2).toBeDefined();

    const k0Base58 = await k0.export({
      type: 'Ed25519VerificationKey2018',
      privateKey: true,
    });
    const k0Jwk = await k0.export({ type: 'JsonWebKey2020', privateKey: true });
    const k1Base58 = await k1.export({
      type: 'X25519KeyAgreementKey2019',
      privateKey: true,
    });
    const k1Jwk = await k1.export({ type: 'JsonWebKey2020', privateKey: true });
    const k2Base58 = await k2.export({
      type: 'EcdsaSecp256k1VerificationKey2019',
      privateKey: true,
    });
    const k2Jwk = await k2.export({ type: 'JsonWebKey2020', privateKey: true });

    fixture.keypair.push({
      mnemonic: m0,
      Ed25519: [k0Base58, k0Jwk],
      X25519: [k1Base58, k1Jwk],
      secp256k1: [k2Base58, k2Jwk],
    });
  }

  //   uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  expect(fixture).toEqual(keypair);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('keypair.json', fixture);
  }
});
