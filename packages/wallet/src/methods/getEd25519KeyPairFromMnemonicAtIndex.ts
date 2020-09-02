import { Jwk } from '@sidetree/core';
import * as ed25519 from '@transmute/did-key-ed25519';

export const getEd25519KeyPairFromMnemonicAtIndex = async (
  mnemonicContent: any,
  index: number
): Promise<any> => {
  const [
    publicKeyJwk,
    privateKeyJwk,
  ] = await Jwk.generateJwkKeyPairFromMnemonic(
    'ed25519',
    mnemonicContent.value,
    index
  );
  const fingerprint = await ed25519.Ed25519KeyPair.fingerprintFromPublicKey({
    publicKeyBase58: await ed25519.keyUtils.publicKeyBase58FromPublicKeyJwk(
      publicKeyJwk
    ),
  });
  const ed25519KeyPair = await ed25519.Ed25519KeyPair.from({
    id: '#' + fingerprint,
    controller: '',
    publicKeyJwk,
    privateKeyJwk,
  });
  return ed25519KeyPair;
};
