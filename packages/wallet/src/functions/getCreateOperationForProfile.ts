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
import { PublicKeyPurpose } from '@sidetree/common';

export const getCreateOperationForProfile = async (
  mnemonic: string,
  index: number,
  profile = 'SVIP',
  options: SidetreeReplaceOptions = {}
): Promise<SidetreeCreateOperation> => {
  if (profile !== 'SVIP') {
    throw new Error('SVIP Profile is only supported profile');
  }
  const signingKeyPair = await toKeyPair(mnemonic, index, 'Ed25519');
  const keyAgreementKeyPair = await toKeyPair(mnemonic, index, 'X25519');

  const delta_object = {
    update_commitment: canonicalizeThenHashThenEncode(
      signingKeyPair.publicKeyJwk
    ),
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: signingKeyPair.id.split('#').pop(),
              type: 'JsonWebKey2020',
              jwk: signingKeyPair.publicKeyJwk,
              purpose: [
                PublicKeyPurpose.General,
                PublicKeyPurpose.Auth,
                PublicKeyPurpose.AssertionMethod,
                PublicKeyPurpose.CapabilityInvocation,
                PublicKeyPurpose.CapabilityDelegation,
              ],
            },
            {
              id: keyAgreementKeyPair.id.split('#').pop(),
              type: 'JsonWebKey2020',
              jwk: keyAgreementKeyPair.publicKeyJwk,
              purpose: [
                PublicKeyPurpose.General,
                PublicKeyPurpose.KeyAgreement,
              ],
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
      signingKeyPair.publicKeyJwk
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
