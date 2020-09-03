import { Jwk } from '@sidetree/core';
import * as secp256k1 from '@transmute/did-key-secp256k1';

import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';

export const getSecp256k1KeyPairFromMnemonicAtIndex = async (
  mnemonic: string,
  index: number
): Promise<Secp256k1KeyPair> => {
  const [
    publicKeyJwk,
    privateKeyJwk,
  ] = await Jwk.generateJwkKeyPairFromMnemonic('secp256k1', mnemonic, index);
  const fingerprint = await secp256k1.Secp256k1KeyPair.fingerprintFromPublicKey(
    {
      publicKeyBase58: await secp256k1.keyUtils.publicKeyBase58FromPublicKeyHex(
        await secp256k1.keyUtils.publicKeyHexFromJwk(publicKeyJwk as any)
      ),
    }
  );
  const secp256k1KeyPair = await secp256k1.Secp256k1KeyPair.from({
    id: '#' + fingerprint,
    controller: '',
    publicKeyJwk,
    privateKeyJwk,
  });
  return secp256k1KeyPair;
};
