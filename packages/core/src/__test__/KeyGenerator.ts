import { PublicKeyPurpose } from '@sidetree/common';
import { toKeyPair } from '@sidetree/crypto';

const { crypto } = require('@sidetree/test-vectors');

export class KeyGenerator {
  constructor(
    public counter: number = 0,
    public mnemonic: string = crypto.mnemonic.mnemonic[0]
  ) {
    //nop
  }

  async getKeyPair(
    mnemonic: string = this.mnemonic,
    index: number = this.counter,
    type = 'secp256k1'
  ) {
    const keypairId = `key-${index}`;
    let publicKeyJwk = undefined;
    let privateKeyJwk = undefined;
    const keypair = await toKeyPair(mnemonic, index, type);
    ({ publicKeyJwk, privateKeyJwk } = await keypair.toJsonWebKeyPair(true));
    this.counter++;
    return {
      id: keypairId,
      publicKeyJwk,
      privateKeyJwk,
    };
  }

  async getSidetreeInternalDataModelKeyPair(_id?: string) {
    const { id, publicKeyJwk, privateKeyJwk } = await this.getKeyPair();

    const sidetreeInternalDataModelPublicKey = {
      id: _id || id,
      type: 'JsonWebKey2020',
      jwk: publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return {
      sidetreeInternalDataModelPublicKey,
      privateKeyJwk: privateKeyJwk,
    };
  }
}
