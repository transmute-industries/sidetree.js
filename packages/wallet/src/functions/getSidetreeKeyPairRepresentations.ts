import canonicalize from 'canonicalize';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { SidetreeJwkPair } from '../types';

export const getSidetreeKeyPairRepresentations = async (
  keypair: any
): Promise<SidetreeJwkPair> => {
  const key = new Secp256k1KeyPair(keypair);
  const publicKeyJwk = await key.toJwk();
  const privateKeyJwk = await key.toJwk(true);
  const kid = publicKeyJwk.kid;
  delete publicKeyJwk.kid;
  delete privateKeyJwk.kid;
  return {
    kid,
    publicKeyJwk: JSON.parse(canonicalize(publicKeyJwk)),
    privateKeyJwk: JSON.parse(canonicalize(privateKeyJwk)),
  };
};
