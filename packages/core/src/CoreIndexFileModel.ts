import { OperationReferenceModel } from '@sidetree/common';
/**
 * Defines the external Core Index File structure.
 */
export default interface CoreIndexFileModel {
  writerLockId?: string;
  provisionalIndexFileUri?: string;
  coreProofFileUri?: string;
  operations?: {
    create?: {
      suffixData: {
        deltaHash: string;
        recoveryCommitment: string;
        type?: string;
      };
    }[];
    recover?: OperationReferenceModel[];
    deactivate?: OperationReferenceModel[];
  };
}
