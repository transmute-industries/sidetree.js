/**
 * Model for representing an EC private key in a JWK format.
 */
export default interface PrivateKeyJwkEc {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
  d: string;
  kid: string;
}
