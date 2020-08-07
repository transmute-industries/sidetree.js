/**
 * Model for representing an EC private key in a JWK format.
 */
export interface PrivateKeyJwkEc {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
  d: string;
  kid: string;
}

/**
 * Model for representing an Okp private key in a JWK format.
 */
export interface PrivateKeyJwkOkp {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  d: string;
  kid: string;
}

/**
 * Model for representing a private key in a JWK format.
 */
export type PrivateKeyJwk = PrivateKeyJwkEc | PrivateKeyJwkOkp;

/**
 * Model for representing an EC public key in a JWK format.
 */
export interface PublicKeyJwkEc {
  kty: 'EC';
  crv: 'secp256k1';
  x: string;
  y: string;
  kid: string;
}

/**
 * Model for representing an OKP public key in a JWK format.
 */
export interface PublicKeyJwkOkp {
  kty: 'OKP';
  crv: 'Ed25519';
  x: string;
  kid: string;
}

/**
 * Model for representing a public key in a JWK format.
 */
export type PublicKeyJwk = PublicKeyJwkEc | PublicKeyJwkOkp;
