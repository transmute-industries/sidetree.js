/**
 * Model for representing a Curve25519 key in a JWK format.
 */
export default interface JwkCurve25519 {
  crv: 'Ed25519';
  x: string;
  d?: string;
  kty: 'OKP';
  kid: string;
}
