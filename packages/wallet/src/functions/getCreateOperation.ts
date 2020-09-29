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

import canonicalize from 'canonicalize';
import base64url from 'base64url';
import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { toKeyPair } from './toKeyPair';
import { SidetreeCreateOperation, SidetreeReplaceOptions } from '../types';
export const getCreateOperation = async (
  mnemonic: string,
  index: number,
  options?: SidetreeReplaceOptions
): Promise<SidetreeCreateOperation> => {
  const first_keypair = await toKeyPair(mnemonic, index, 'secp256k1');

  const delta_object = {
    update_commitment: canonicalizeThenHashThenEncode(
      first_keypair.publicKeyJwk
    ),
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: first_keypair.id.split('#').pop(),
              type: 'JsonWebKey2020',
              jwk: first_keypair.publicKeyJwk,
              purpose: ['auth', 'general'],
            },
          ],
          ...options,
        },
      },
    ],
  };
  const delta = base64url.encode(canonicalize(delta_object));
  const canonical_suffix_data = canonicalize({
    delta_hash: canonicalizeThenHashThenEncode(delta_object),
    recovery_commitment: canonicalizeThenHashThenEncode(
      first_keypair.publicKeyJwk
    ),
  });
  const suffix_data = base64url.encode(canonical_suffix_data);
  const createOperation: SidetreeCreateOperation = {
    type: 'create',
    suffix_data,
    delta,
  };

  return createOperation;
};
