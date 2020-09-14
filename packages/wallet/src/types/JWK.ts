export interface PrivateKeyJwk {
  kty: string;
  crv: string;
  x: string;
  y: string;
  d: string;
  kid: string;
}

export interface PublicKeyJwk {
  kty: string;
  crv: string;
  x: string;
  y: string;
  kid: string;
}
