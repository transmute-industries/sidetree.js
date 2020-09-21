import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';

export const createSigner = async (privateKeyJwk: any) => {
  let key: any;

  switch (privateKeyJwk.crv) {
    case 'Ed25519': {
      key = await Ed25519KeyPair.from({
        publicKeyJwk: privateKeyJwk,
        privateKeyJwk,
      });
      break;
    }
    case 'secp256k1': {
      key = await Secp256k1KeyPair.from({
        publicKeyJwk: privateKeyJwk,
        privateKeyJwk,
      });
      break;
    }
  }

  if (!key) {
    throw new Error('Unsupported crv ' + privateKeyJwk.crv);
  }

  const signer = key.signer();

  return {
    sign: (data: Buffer) => {
      return signer.sign({ data });
    },
  };
};
