import {
  ErrorCode,
  SidetreeError,
  PublicKeyJwkEc,
  PublicKeyJwkOkp,
  PrivateKeyJwkEc,
  PrivateKeyJwkOkp,
  PrivateKeyJwk,
  PublicKeyJwk,
} from '@sidetree/common';
import { JWK } from 'jose';
import * as bip39 from 'bip39';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import hdkey from 'hdkey';
import { from as keytoFrom } from '@trust/keyto';

/**
 * Class containing reusable JWK operations.
 */
export default class Jwk {
  /**
   * Generates ED25519 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateEd25519KeyPair(): Promise<
    [PublicKeyJwkOkp, PrivateKeyJwkOkp]
  > {
    const keyPair = await JWK.generate('OKP', 'Ed25519');
    const privateKey = keyPair.toJWK(true) as PrivateKeyJwkOkp;
    const publicKey = keyPair.toJWK(false) as PublicKeyJwkOkp;
    return [publicKey, privateKey];
  }

  // Helper method to generate keys from a mnemonic
  public static async getBufferAtIndex(
    mnemonic: string,
    index: number
  ): Promise<Buffer> {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const hdPath = `m/44'/60'/0'/0/${index}`;
    const addrNode = root.derive(hdPath);
    return addrNode.privateKey;
  }

  private static async generateEd25519KeyPairFromMnemonic(
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwkOkp, PrivateKeyJwkOkp]> {
    const privateKeyBuffer = await Jwk.getBufferAtIndex(mnemonic, index);
    const keyPair = await Ed25519KeyPair.generate({
      seed: privateKeyBuffer,
    });
    const ed25519KeyPair = new Ed25519KeyPair(keyPair);
    const publicKeyJwk = (await ed25519KeyPair.toJwk(false)) as PublicKeyJwkOkp;
    const privateKeyJwk = (await ed25519KeyPair.toJwk(
      true
    )) as PrivateKeyJwkOkp;
    return [publicKeyJwk, privateKeyJwk];
  }

  /**
   * Generates SECP256K1 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateSecp256k1KeyPair(): Promise<
    [PublicKeyJwkEc, PrivateKeyJwkEc]
  > {
    const keyPair = await JWK.generate('EC', 'secp256k1');
    const publicKey = keyPair.toJWK(false) as PublicKeyJwkEc;
    const privateKey = keyPair.toJWK(true) as PrivateKeyJwkEc;
    return [publicKey, privateKey];
  }

  public static async generateJwkKeyPairFromMnemonic(
    keyType: string,
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwk, PrivateKeyJwk]> {
    switch (keyType) {
      case 'secp256k1':
        return this.generateSecp256k1KeyPairFromMnemonic(mnemonic, index);
      case 'ed25519':
        return this.generateEd25519KeyPairFromMnemonic(mnemonic, index);
      default:
        throw new Error('Invalid key type');
    }
  }

  private static async generateSecp256k1KeyPairFromMnemonic(
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwkEc, PrivateKeyJwkEc]> {
    const privateKeyBuffer = await Jwk.getBufferAtIndex(mnemonic, index);
    const publicKeyJwk = keytoFrom(privateKeyBuffer, 'blk').toJwk('public');
    publicKeyJwk.crv = 'secp256k1';
    const privateKeyJwk = keytoFrom(privateKeyBuffer, 'blk').toJwk('private');
    privateKeyJwk.crv = 'secp256k1';
    return [publicKeyJwk, privateKeyJwk];
  }

  /**
   * Validates the given key is a public key in JWK format allowed by Sidetree.
   * @throws SidetreeError if given object is not a key in JWK format allowed by Sidetree.
   */
  public static validatePublicJwk(jwk: any): void {
    if (jwk === undefined) {
      throw new SidetreeError(ErrorCode.JwkUndefined);
    }

    // TODO: Check validity with JSON schema...
    const allowedProperties = new Set(['kty', 'crv', 'x', 'y', 'kid']);
    for (const property in jwk) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(ErrorCode.JwkHasUnknownProperty);
      }
    }

    switch (jwk.crv) {
      case 'Ed25519':
        if (jwk.kty !== 'OKP') {
          throw new SidetreeError(ErrorCode.JwkMissingOrInvalidKty);
        }
        if (typeof jwk.x !== 'string') {
          throw new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeX);
        }
        break;
      case 'secp256k1':
        if (jwk.kty !== 'EC') {
          throw new SidetreeError(ErrorCode.JwkMissingOrInvalidKty);
        }
        if (typeof jwk.x !== 'string') {
          throw new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeX);
        }
        if (typeof jwk.y !== 'string') {
          throw new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeY);
        }
        break;
      default:
        throw new SidetreeError(ErrorCode.JwkMissingOrInvalidCrv);
    }
  }

  /**
   * Gets the public key given the private ES256K key.
   * Mainly used for testing purposes.
   */
  public static getCurve25519PublicKey(
    privateKey: PrivateKeyJwkOkp
  ): PublicKeyJwkOkp {
    const keyCopy = Object.assign({}, privateKey);

    // Delete the private key portion.
    delete keyCopy.d;

    return keyCopy;
  }
}
