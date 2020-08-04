import {
  ErrorCode,
  SidetreeError,
  JwkCurve25519,
  JwkEs256k,
} from '@sidetree/common';
import { JWK } from 'jose';

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

  /**
   * Generates SECP256K1 key pair.
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateEs256kKeyPair(): Promise<[JwkEs256k, JwkEs256k]> {
    const keyPair = await JWK.generate('EC', 'secp256k1');
    const publicKey = keyPair.toJWK(false);
    const privateKey = keyPair.toJWK(true);
    return [publicKey, privateKey];
  }

  /**
   * Validates the given key is a public key in JWK format allowed by Sidetree.
   * @throws SidetreeError if given object is not a key in JWK format allowed by Sidetree.
   */
  public static validateJwk(jwk: any): void {
    if (jwk === undefined) {
      throw new SidetreeError(ErrorCode.JwkUndefined);
    }

    const allowedProperties = new Set(['kty', 'crv', 'x', 'kid']);
    for (const property in jwk) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(ErrorCode.JwkHasUnknownProperty);
      }
    }

    if (jwk.kty !== 'OKP') {
      throw new SidetreeError(ErrorCode.JwkMissingOrInvalidKty);
    }

    if (jwk.crv !== 'Ed25519') {
      throw new SidetreeError(ErrorCode.JwkMissingOrInvalidCrv);
    }

    if (typeof jwk.x !== 'string') {
      throw new SidetreeError(ErrorCode.JwkMissingOrInvalidTypeX);
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
