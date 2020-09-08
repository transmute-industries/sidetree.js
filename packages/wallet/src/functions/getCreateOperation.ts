import canonicalize from 'canonicalize';
import base64url from 'base64url';
import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { getSidetreeKeyPairRepresentations } from './getSidetreeKeyPairRepresentations';
import { toKeyPair } from './toKeyPair';
import { SidetreeCreateOperation, SidetreeReplaceOptions } from '../types';
export const getCreateOperation = async (
  mnemonic: string,
  index: number,
  options?: SidetreeReplaceOptions
): Promise<SidetreeCreateOperation> => {
  const first_keypair = await toKeyPair(
    mnemonic,
    index,
    'EcdsaSecp256k1Verification2018'
  );
  const first_key = await getSidetreeKeyPairRepresentations(first_keypair);

  const delta_object = {
    update_commitment: canonicalizeThenHashThenEncode(first_key.publicKeyJwk),
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: first_key.kid,
              type: 'JsonWebKey2020',
              jwk: first_key.publicKeyJwk,
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
    recovery_commitment: canonicalizeThenHashThenEncode(first_key.publicKeyJwk),
  });
  const suffix_data = base64url.encode(canonical_suffix_data);
  const createOperation: SidetreeCreateOperation = {
    type: 'create',
    suffix_data,
    delta,
  };

  return createOperation;
};
