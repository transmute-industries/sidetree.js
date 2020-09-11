import { KeyGenerator } from './KeyGenerator';

export const generateKeyFixtures = async () => {
  const keyGenerator = new KeyGenerator();
  const k0 = await keyGenerator.getKeyPair();
  const k1 = await keyGenerator.getKeyPair('secp256k1');
  const k2 = await keyGenerator.getKeyPair();
  const k3 = await keyGenerator.getKeyPair('ed25519');

  let keypair = {
    mnemonic: keyGenerator.mnemonic,
    keypair: [k0, k1, k2, k3],
  };

  return keypair;
};
