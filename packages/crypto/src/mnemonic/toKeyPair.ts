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

import * as bip39 from 'bip39';
import hdkey from 'hdkey';
import { Ed25519KeyPair } from '@transmute/ed25519-key-pair';
import { JsonWebKey } from '@transmute/json-web-signature';
import { SIDETREE_BIP44_COIN_TYPE } from '../constants';

// See https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve
export const toKeyPair = async (
  mnemonic: string,
  index: number,
  type = 'Ed25519',
  hdPath?: string
): Promise<any> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const addrNode = root.derive(
    hdPath ? hdPath : `m/44'/${SIDETREE_BIP44_COIN_TYPE}'/0'/0/${index}`
  );

  let keypair: any;

  switch (type) {
    case 'secp256k1': {
      keypair = await JsonWebKey.generate({
        kty: 'EC',
        crv: type,
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
    case 'X25519': {
      keypair = await JsonWebKey.generate({
        kty: 'OKP',
        crv: 'Ed25519', // TODO: change this to 'X25519' based on SRI recommendations for did core.
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      keypair = await Ed25519KeyPair.toX25519KeyPair(keypair as any);
      break;
    }
    case 'Ed25519':
    default: {
      keypair = await JsonWebKey.generate({
        kty: 'OKP',
        crv: type,
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
  }

  return keypair;
};
