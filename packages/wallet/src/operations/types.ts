/**
 * Sidetree operation types.
 */

export enum OperationType {
  Create = 'create',
  Update = 'update',
  Deactivate = 'deactivate',
  Recover = 'recover',
}

/**
 * DID Document key purpose.
 */
export enum SidetreePublicKeyPurpose {
  Authentication = 'authentication',
  AssertionMethod = 'assertionMethod',
  CapabilityInvocation = 'capabilityInvocation',
  CapabilityDelegation = 'capabilityDelegation',
  KeyAgreement = 'keyAgreement',
}

/**
 * Defines the data structure of a service declared in a DID Document.
 */
export interface SidetreeServiceModel {
  id: string;
  type: string;
  serviceEndpoint: string | object;
}

/**
 * Data model representing a public key in the DID Document.
 */
export interface SidetreePublicKeyModel {
  id: string;
  type: string;
  publicKeyJwk: object;
  purposes?: SidetreePublicKeyPurpose[];
}

/**
 * Defines the document structure used by Sidetree.
 */
export interface SidetreeDocumentModel {
  publicKeys?: SidetreePublicKeyModel[];
  services?: SidetreeServiceModel[];
}

/**
 * Operation key type, indicates if a key is a public or private key.
 */
export enum OperationKeyType {
  Public = 'public',
  Private = 'private',
}

/**
 * Model for representing a JWK Key.
 */
export interface Jwk {
  kty: string;
  crv: string;
  x: string;
  y: string;
  d?: string; // Only used by a private key.
}
