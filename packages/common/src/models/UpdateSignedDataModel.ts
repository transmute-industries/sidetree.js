import { PublicKeyJwk } from './JwkModels';

/**
/**
 * Defines the internal decoded schema of signed data of a update operation.
 */
export default interface UpdateSignedDataModel {
  deltaHash: string;
  updateKey: PublicKeyJwk;
}
