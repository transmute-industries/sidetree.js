/**
 * Model for representing an OKP public key in a JWK format.
 */
export default interface PublicKeyJwk {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  kid: string;
}
