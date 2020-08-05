/**
 * Model for representing a public key in a JWK format.
 */
export default interface PrivateKeyJwk {
  kty: string;
  crv: string;
  x: string;
  y?: string;
  d: string;
}
