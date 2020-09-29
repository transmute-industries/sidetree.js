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
import { createJwsSigner } from '@sidetree/crypto';
import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { toKeyPair } from './toKeyPair';
import { PublicKeyPurpose } from '@sidetree/common';

import { SidetreeRecoverOperation, SidetreeReplaceOptions } from '../types';

export const getRecoverOperationForProfile = async (
  mnemonic: string,
  index: number,
  didUniqueSuffix: string,
  profile = 'SVIP',
  options: SidetreeReplaceOptions = {}
): Promise<SidetreeRecoverOperation> => {
  if (profile !== 'SVIP') {
    throw new Error('SVIP Profile is only supported profile');
  }
  const currentRecoveryKeyPair = await toKeyPair(mnemonic, index, 'Ed25519');
  const nextRecoveryKeyPair = await toKeyPair(mnemonic, index + 1, 'Ed25519');

  const signingKeyPair = currentRecoveryKeyPair;
  const keyAgreementKeyPair = await toKeyPair(mnemonic, index + 1, 'X25519');

  const signer = await createJwsSigner(currentRecoveryKeyPair.privateKeyJwk);

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

  const jws_payload = {
    delta_hash: canonicalizeThenHashThenEncode(deleta_object),
    recovery_key: JSON.parse(canonicalize(currentRecoveryKeyPair.publicKeyJwk)),
    recovery_commitment: canonicalizeThenHashThenEncode(
      nextRecoveryKeyPair.publicKeyJwk
    ),
  };

  const jws = await signer.sign(jws_payload as any);

  const encoded_delta = base64url.encode(canonicalize(deleta_object));
  const recoverOperation: SidetreeRecoverOperation = {
    type: 'recover',
    did_suffix: didUniqueSuffix,
    signed_data: jws,
    delta: encoded_delta,
  };
  return recoverOperation;
};
