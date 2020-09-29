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
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { SIDETREE_BIP44_COIN_TYPE } from '../constants';

// See https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve
export const toKeyPair = async (
  mnemonic: string,
  index: number,
  type = 'Ed25519'
): Promise<any> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const hdPath = `m/44'/${SIDETREE_BIP44_COIN_TYPE}'/0'/0/${index}`;
  const addrNode = root.derive(hdPath);

  let keypair: any;

  switch (type) {
    case 'secp256k1': {
      keypair = await Secp256k1KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
    case 'X25519': {
      keypair = await Ed25519KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      keypair = keypair.toX25519KeyPair(true);
      break;
    }
    case 'Ed25519':
    default: {
      keypair = await Ed25519KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
  }

  return keypair;
};
