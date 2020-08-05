/**
 * Model for representing a public key in a JWK format.
 */
export default interface PublicKeyJwk {
  kty: string;
  crv: string;
  x: string;
  y?: string;
}
