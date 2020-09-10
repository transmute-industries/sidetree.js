import { FileWriter } from './FileWriter';
import { KeyGenerator } from './KeyGenerator';

export const generateKeyFixtures = async () => {
  const keyGenerator = new KeyGenerator();
  // secp256K1 key material
  const [
    secp256KPublicKeyJwk,
    secp256KPrivateKeyJwk,
  ] = await keyGenerator.getSecp256K1KeyPair();
  FileWriter.write(
    'secp256KPublicKeyJwk.json',
    JSON.stringify(secp256KPublicKeyJwk, null, 2)
  );
  FileWriter.write(
    'secp256KPrivateKeyJwk.json',
    JSON.stringify(secp256KPrivateKeyJwk, null, 2)
  );

  // Get random buffer used to generate the JWKs above ^
  const privateKeyBuffer = await keyGenerator.getPrivateKeyBuffer();
  FileWriter.write('secp256KPrivateKeyBuffer.txt', privateKeyBuffer);

  // ed25519 key material
  const [
    ed25519PublicKeyJwk,
    ed25519PrivateKeyJwk,
  ] = await keyGenerator.getEd25519KeyPair();
  FileWriter.write(
    'ed25519PublicKeyJwk.json',
    JSON.stringify(ed25519PublicKeyJwk, null, 2)
  );
  FileWriter.write(
    'ed25519PrivateKeyJwk.json',
    JSON.stringify(ed25519PrivateKeyJwk, null, 2)
  );
};
