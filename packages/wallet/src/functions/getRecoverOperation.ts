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
