/**
 * Model for representing an EC private key in a JWK format.
 */
export type PrivateKeyJwkSecp256k1 = {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
  d: string;
  kid: string;
};

/**
 * Model for representing an Okp private key in a JWK format.
 */
export type PrivateKeyJwkEd25519 = {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  d: string;
  kid: string;
};

/**
 * Model for representing a private key in a JWK format.
 */
export type PrivateKeyJwk = PrivateKeyJwkSecp256k1 | PrivateKeyJwkEd25519;

/**
 * Model for representing an EC public key in a JWK format.
 */
export type PublicKeyJwkSecp256k1 = {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
  kid: string;
};

/**
 * Model for representing an OKP public key in a JWK format.
 */
export type PublicKeyJwkEd25519 = {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  kid: string;
};

/**
 * Model for representing a public key in a JWK format.
 */
export type PublicKeyJwk = PublicKeyJwkSecp256k1 | PublicKeyJwkEd25519;
