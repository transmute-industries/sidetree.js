import PublicKeyPurpose from '../enums/PublicKeyPurpose';

/**
 * Data model representing a public key in the 'publicKey' array in patches.
 */
export default interface PublicKeyModel {
  id: string;
  type: string;
  jwk: any;
  purpose: PublicKeyPurpose[];
}
