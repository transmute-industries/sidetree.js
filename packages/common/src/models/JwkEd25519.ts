/**
 * Model for representing a Ed25519 key in a JWK format.
 */
export default interface JwkEd25519 {
  crv: 'Ed25519';
  x: string;
  d?: string;
  kty: 'OKP';
  kid: string;
}
