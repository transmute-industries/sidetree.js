import { Jwk } from '../index';
import { PublicKeyPurpose } from '@sidetree/common';

export class KeyGenerator {
  constructor(
    public counter: number = 0,
    public mnemonic: string = 'mosquito sorry ring page rough future world beach pretty calm person arena'
  ) {
    //nop
  }

  async getKeyPair(
    mnemonic: string = this.mnemonic,
    index: number = this.counter,
    type: string = 'ed25519'
  ) {
    let keypairId = `key-${index}`;
    let publicKeyJwk = undefined;
    let privateKeyJwk = undefined;
    [publicKeyJwk, privateKeyJwk] = await Jwk.generateJwkKeyPairFromMnemonic(
      type,
      mnemonic,
      index
    );
    this.counter++;

    return {
      id: keypairId,
      publicKeyJwk,
      privateKeyJwk,
    };
  }

  async getPrivateKeyBuffer() {
    return Jwk.getBufferAtIndex(this.mnemonic, this.counter);
  }

  async getSidetreeInternalDataModelKeyPair(id?: string) {
    const keypair = await this.getKeyPair();
    const sidetreeInternalDataModelPublicKey = {
      id: id || keypair.id,
      type: 'Ed25519VerificationKey2018',
      jwk: keypair.publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return {
      sidetreeInternalDataModelPublicKey,
      privateKeyJwk: keypair.privateKeyJwk,
    };
  }
}
