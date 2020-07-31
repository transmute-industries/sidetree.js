import { ErrorCode, SidetreeError, JwkCurve25519 } from '@sidetree/common';
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
   * Validates the given key is a SECP256K1 public key in JWK format allowed by Sidetree.
   * @throws SidetreeError if given object is not a SECP256K1 public key in JWK format allowed by Sidetree.
   */
  public static validateJwkCurve25519(jwk: any): void {
    if (jwk === undefined) {
      throw new SidetreeError(ErrorCode.JwkCurve25519Undefined);
    }

    const allowedProperties = new Set(['kty', 'crv', 'x', 'kid']);
    for (const property in jwk) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(ErrorCode.JwkCurve25519HasUnknownProperty);
      }
    }

    if (jwk.kty !== 'OKP') {
      throw new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidKty);
    }

    if (jwk.crv !== 'Ed25519') {
      throw new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidCrv);
    }

    if (typeof jwk.x !== 'string') {
      throw new SidetreeError(ErrorCode.JwkCurve25519MissingOrInvalidTypeX);
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
