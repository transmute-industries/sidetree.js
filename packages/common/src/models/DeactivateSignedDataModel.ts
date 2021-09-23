import { PublicKeyJwk } from './JwkModels';

/**
 * Defines the internal decoded schema of signed data of a recover operation.
 */
export default interface DeactivateSignedDataModel {
  didSuffix: string;
  recoveryKey: PublicKeyJwk;
}
