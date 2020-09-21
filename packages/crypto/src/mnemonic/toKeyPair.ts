import * as bip39 from 'bip39';
import hdkey from 'hdkey';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { SIDETREE_BIP44_COIN_TYPE } from '../constants';

// See https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve
export const toKeyPair = async (
  mnemonic: string,
  index: number,
  type = 'Ed25519'
): Promise<any> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const hdPath = `m/44'/${SIDETREE_BIP44_COIN_TYPE}'/0'/0/${index}`;
  const addrNode = root.derive(hdPath);

  let keypair: any;

  switch (type) {
    case 'secp256k1': {
      keypair = await Secp256k1KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
    case 'X25519': {
      keypair = await Ed25519KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      keypair = keypair.toX25519KeyPair(true);
      break;
    }
    case 'Ed25519':
    default: {
      keypair = await Ed25519KeyPair.generate({
        secureRandom: () => {
          return addrNode._privateKey;
        },
      });
      break;
    }
  }

  return keypair;
};
