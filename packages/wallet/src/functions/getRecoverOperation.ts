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

import { ES256K } from '@transmute/did-key-secp256k1';

import canonicalize from 'canonicalize';
import base64url from 'base64url';

import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { toKeyPair } from './toKeyPair';

import {
  SidetreeRecoverOperation,
  SidetreeReplaceOptions,
  PrivateKeyJwk,
} from '../types';
export const getRecoverOperation = async (
  mnemonic: string,
  index: number,
  didUniqueSuffix: string,
  options?: SidetreeReplaceOptions
): Promise<SidetreeRecoverOperation> => {
  const currentRecoveryKeyPair = await toKeyPair(mnemonic, index, 'secp256k1');
  const nextRecoveryKeyPair = await toKeyPair(mnemonic, index + 1, 'secp256k1');

  const deleta_object = {
    update_commitment: canonicalizeThenHashThenEncode(
      nextRecoveryKeyPair.publicKeyJwk
    ),

    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: nextRecoveryKeyPair.id.split('#').pop(),
              type: 'JsonWebKey2020',
              jwk: nextRecoveryKeyPair.publicKeyJwk,
              purpose: ['auth', 'general'],
            },
          ],
          ...options,
        },
      },
    ],
  };
  const jws_header = { alg: 'ES256K' };

  const jws_payload = {
    delta_hash: canonicalizeThenHashThenEncode(deleta_object),
    recovery_key: JSON.parse(canonicalize(currentRecoveryKeyPair.publicKeyJwk)),
    recovery_commitment: canonicalizeThenHashThenEncode(
      nextRecoveryKeyPair.publicKeyJwk
    ),
  };

  const jws = await ES256K.sign(
    jws_payload,
    currentRecoveryKeyPair.privateKeyJwk as PrivateKeyJwk,
    jws_header
  );
  const encoded_delta = base64url.encode(canonicalize(deleta_object));
  const recoverOperation: SidetreeRecoverOperation = {
    type: 'recover',
    did_suffix: didUniqueSuffix,
    signed_data: jws,
    delta: encoded_delta,
  };
  return recoverOperation;
};
