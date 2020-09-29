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

import { createJwsSigner } from './createJwsSigner';

const temp = {
  id: '#zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX',
  type: 'JsonWebKey2020',
  controller: 'did:key:zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX',
  publicKeyJwk: {
    kty: 'EC',
    crv: 'secp256k1',
    x: 'GBMxavme-AfIVDKqI6WBJ4V5wZItsxJ9muhxPByllHQ',
    y: 'SChlfVBhTXG_sRGc9ZdFeCYzI3Kbph3ivE12OFVk4jo',
  },
  privateKeyJwk: {
    kty: 'EC',
    crv: 'secp256k1',
    d: 'm5N7gTItgWz6udWjuqzJsqX-vksUnxJrNjD5OilScBc',
    x: 'GBMxavme-AfIVDKqI6WBJ4V5wZItsxJ9muhxPByllHQ',
    y: 'SChlfVBhTXG_sRGc9ZdFeCYzI3Kbph3ivE12OFVk4jo',
  },
};

it('createJwsSigner', async () => {
  const signer = await createJwsSigner(temp.privateKeyJwk);
  const signature = await signer.sign(Buffer.from('123'));
  expect(signature).toBe(
    'eyJhbGciOiJFUzI1NksifQ.eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzQ5LDUwLDUxXX0.v-LA68URxGUviUC6PyA_0BreWodvYcBIVQjwYJX7f3hv3RNGKQMLaUJ79mBrTHiPuh4dorpFUwRldJt40cYJSQ'
  );
});
