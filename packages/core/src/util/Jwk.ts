import {
  ErrorCode,
  SidetreeError,
  JwkCurve25519,
  JwkEs256k,
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
    [JwkCurve25519, JwkCurve25519]
  > {
    const keyPair = await JWK.generate('OKP', 'Ed25519');
    const privateKey = keyPair.toJWK(true) as JwkCurve25519;
    const publicKey = keyPair.toJWK(false) as JwkCurve25519;
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

  public static async generateDeterministicEd25519KeyPair(
    mnemonic: string,
    index: number
  ): Promise<[JwkCurve25519, JwkCurve25519]> {
    const privateKeyBuffer = await Jwk.getBufferAtIndex(mnemonic, index);
    const keyPair = await Ed25519KeyPair.generate({
      seed: privateKeyBuffer,
    });
    const ed25519KeyPair = new Ed25519KeyPair(keyPair);
    const publicKeyJwk = (await ed25519KeyPair.toJwk(false)) as JwkCurve25519;
    const privateKeyJwk = (await ed25519KeyPair.toJwk(true)) as JwkCurve25519;
    return [publicKeyJwk, privateKeyJwk];
  }

  /**
   * Generates SECP256K1 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateSecp256k1KeyPair(): Promise<
    [JwkEs256k, JwkEs256k]
  > {
    const keyPair = await JWK.generate('EC', 'secp256k1');
    const publicKey = keyPair.toJWK(false);
    const privateKey = keyPair.toJWK(true);
    return [publicKey, privateKey];
  }

  public static async generateDeterministicSecp256k1KeyPair(
    mnemonic: string,
    index: number
  ): Promise<[JwkEs256k, JwkEs256k]> {
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
    privateKey: JwkCurve25519
  ): JwkCurve25519 {
    const keyCopy = Object.assign({}, privateKey);

    // Delete the private key portion.
    delete keyCopy.d;

    return keyCopy;
  }
}
