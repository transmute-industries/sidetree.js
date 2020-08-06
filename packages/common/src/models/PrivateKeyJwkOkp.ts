/**
 * Model for representing an Okp private key in a JWK format.
 */
export default interface PrivateKeyJwkOkp {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  d: string;
  kid: string;
}
