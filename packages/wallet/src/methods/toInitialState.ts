import { Multihash } from '@sidetree/common';
import base64url from 'base64url';

export const toInitialState = async (secp256k1KeyPair: any) => {
  const updateAndRecoveryPublicKeyJwk = await secp256k1KeyPair.toJwk();
  const { kid } = updateAndRecoveryPublicKeyJwk;
  delete updateAndRecoveryPublicKeyJwk.kid;

  const recovery_commitment = Multihash.canonicalizeThenHashThenEncode(
    updateAndRecoveryPublicKeyJwk
  );

  const delta_object = {
    update_commitment: recovery_commitment,
    patches: [
      {
        action: 'replace',
        document: {
          public_keys: [
            {
              id: kid,
              type: 'JsonWebKey2020',
              jwk: updateAndRecoveryPublicKeyJwk,
              purpose: ['auth', 'general'],
            },
          ],
        },
      },
    ],
  };

  const delta_hash = Multihash.hashThenEncode(
    Buffer.from(JSON.stringify(delta_object)),
    18
  );

  const suffix_data_object = {
    delta_hash,
    recovery_commitment,
  };

  return (
    base64url.encode(JSON.stringify(suffix_data_object)) +
    '.' +
    base64url.encode(JSON.stringify(delta_object))
  );
};
