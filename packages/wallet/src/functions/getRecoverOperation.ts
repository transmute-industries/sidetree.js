import { ES256K } from '@transmute/did-key-secp256k1';

import canonicalize from 'canonicalize';
import base64url from 'base64url';
import { getSidetreeKeyPairRepresentations } from './getSidetreeKeyPairRepresentations';

import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { toKeyPair } from './toKeyPair';

import { SidetreeRecoverOperation, SidetreeReplaceOptions } from '../types';
export const getRecoverOperation = async (
  mnemonic: string,
  index: number,
  didUniqueSuffix: string,
  options?: SidetreeReplaceOptions
): Promise<SidetreeRecoverOperation> => {
  const currentRecoveryKeyPair = await toKeyPair(
    mnemonic,
    index,
    'EcdsaSecp256k1Verification2018'
  );
  const currentRecoveryKey = await getSidetreeKeyPairRepresentations(
    currentRecoveryKeyPair
  );

  const nextRecoveryKeyPair = await toKeyPair(
    mnemonic,
    index + 1,
    'EcdsaSecp256k1Verification2018'
  );
  const nextRecoveryKey = await getSidetreeKeyPairRepresentations(
    nextRecoveryKeyPair
  );

  const deleta_object = {
    update_commitment: canonicalizeThenHashThenEncode(
      nextRecoveryKey.publicKeyJwk
    ),

    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: nextRecoveryKey.kid,
              type: 'JsonWebKey2020',
              jwk: nextRecoveryKey.publicKeyJwk,
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
    recovery_key: JSON.parse(canonicalize(currentRecoveryKey.publicKeyJwk)),
    recovery_commitment: canonicalizeThenHashThenEncode(
      nextRecoveryKey.publicKeyJwk
    ),
  };

  const jws = await ES256K.sign(
    jws_payload,
    currentRecoveryKey.privateKeyJwk as any,
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
