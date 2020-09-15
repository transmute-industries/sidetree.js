import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';

export const createVerifier = async (publicKeyJwk: any) => {
  let key: any;

  switch (publicKeyJwk.crv) {
    case 'Ed25519': {
      key = await Ed25519KeyPair.from({
        publicKeyJwk: publicKeyJwk,
      });
      break;
    }
    case 'secp256k1': {
      key = await Secp256k1KeyPair.from({
        publicKeyJwk: publicKeyJwk,
      });
      break;
    }
  }

  if (!key) {
    throw new Error('Unsupported crv ' + publicKeyJwk.crv);
  }

  const verifier = key.verifier();

  return {
    verify: (data: Buffer, signature: Buffer) => {
      return verifier.verify({ data, signature });
    },
  };
};
