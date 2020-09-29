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

import { keypair, jws } from '../__fixtures__';
import { writeFixture } from '../test/util';

import { createJwsSigner, createJwsVerifier } from '../signature';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    jws: [],
  };

  for (let i = 0; i < keypair.keypair.length; i++) {
    const kps = keypair.keypair[i];
    const message = Buffer.from(kps.mnemonic);
    const edDsaSigner = await createJwsSigner(kps.Ed25519[1].privateKeyJwk);
    const edDsaJws = await edDsaSigner.sign(message);
    const edDsaVerifier = await createJwsVerifier(kps.Ed25519[1].publicKeyJwk);
    const edDsaJwsVerified = await edDsaVerifier.verify(edDsaJws);
    const es256kSigner = await createJwsSigner(kps.secp256k1[1].privateKeyJwk);
    const es256kJws = await es256kSigner.sign(message);
    const es256kVerifier = await createJwsVerifier(
      kps.secp256k1[1].publicKeyJwk
    );
    const es256kJwsVerified = await es256kVerifier.verify(es256kJws);

    fixture.jws.push({
      message: kps.mnemonic,
      EdDSA: edDsaJws,
      EdDSAVerified: edDsaJwsVerified,
      ES256K: es256kJws,
      ES256KVerified: es256kJwsVerified,
    });
  }

  //   uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  expect(fixture).toEqual(jws);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('jws.json', fixture);
  }
});
