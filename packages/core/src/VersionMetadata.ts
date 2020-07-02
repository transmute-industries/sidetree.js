import { AbstractVersionMetadata, protocolParameters } from '@sidetree/common';

/**
 * Implementation of the abstract VersionMetadata.
 */
export default class VersionMetadata extends AbstractVersionMetadata {
  public hashAlgorithmInMultihashCode: number;
  public normalizedFeeToPerOperationFeeMultiplier: number;
  public valueTimeLockAmountMultiplier: number;
  public constructor() {
    super();
    this.hashAlgorithmInMultihashCode =
      protocolParameters.hashAlgorithmInMultihashCode;
    this.normalizedFeeToPerOperationFeeMultiplier =
      protocolParameters.normalizedFeeToPerOperationFeeMultiplier;
    this.valueTimeLockAmountMultiplier =
      protocolParameters.valueTimeLockAmountMultiplier;
  }
}
