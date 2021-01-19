/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
