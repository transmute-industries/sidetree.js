import { Jwk } from '../index';

import { PublicKeyPurpose } from '@sidetree/common';

export class KeyGenerator {
  mnemonic =
    'mosquito sorry ring page rough future world beach pretty calm person arena';

  counter = 0;

  async getEd25519KeyPair() {
    this.counter += 1;
    const [
      publicKeyJwk,
      privateKeyJwk,
    ] = await Jwk.generateJwkKeyPairFromMnemonic(
      'ed25519',
      this.mnemonic,
      this.counter
    );
    return [publicKeyJwk, privateKeyJwk];
  }

  async getPrivateKeyBuffer() {
    return Jwk.getBufferAtIndex(this.mnemonic, this.counter);
  }

  async getSecp256K1KeyPair() {
    this.counter += 1;
    const [
      publicKeyJwk,
      privateKeyJwk,
    ] = await Jwk.generateJwkKeyPairFromMnemonic(
      'secp256k1',
      this.mnemonic,
      this.counter
    );
    return [publicKeyJwk, privateKeyJwk];
  }

  async getDidDocumentKeyPair(id: string) {
    const [publicKeyJwk, privateKeyJwk] = await this.getEd25519KeyPair();
    const didDocPublicKey = {
      id,
      type: 'Ed25519VerificationKey2018',
      jwk: publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return [didDocPublicKey, privateKeyJwk];
  }
}
