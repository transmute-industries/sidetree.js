import canonicalize from 'canonicalize';
import base64url from 'base64url';
import { canonicalizeThenHashThenEncode } from './sidetreeEncoding';
import { toKeyPair } from './toKeyPair';
import { SidetreeCreateOperation } from '../types';
import { PublicKeyPurpose } from '@sidetree/common';

export const getCreateOperationForProfile = async (
  mnemonic: string,
  index: number,
  profile: string = 'SVIP'
): Promise<SidetreeCreateOperation> => {
  console.log(profile, 'is experimental');
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
