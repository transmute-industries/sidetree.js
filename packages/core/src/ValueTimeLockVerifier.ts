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

import {
  ErrorCode,
  IVersionMetadataFetcher,
  protocolParameters,
  SidetreeError,
  ValueTimeLockModel,
} from '@sidetree/common';

/**
 * Encapsulates the functionality to compute and verify the value time lock amounts.
 */
export default class ValueTimeLockVerifier {
  /**
   * Calculates the maximum number of operations allowed to be written for the given lock information. If
   * there is no lock then it returns the number of operations which do not require a lock.
   *
   * @param valueTimeLock The lock object if exists
   * @param versionMetadataFetcher The mapper from transaction time to version metadata
   */
  public static calculateMaxNumberOfOperationsAllowed(
    valueTimeLock: ValueTimeLockModel | undefined,
    versionMetadataFetcher: IVersionMetadataFetcher
  ) {
    if (valueTimeLock === undefined) {
      return protocolParameters.maxNumberOfOperationsForNoValueTimeLock;
    }

    const versionMetadata = versionMetadataFetcher.getVersionMetadata(
      valueTimeLock.lockTransactionTime
    );
    const normalizedFeeToPerOperationFeeMultiplier =
      versionMetadata.normalizedFeeToPerOperationFeeMultiplier;
    const valueTimeLockAmountMultiplier =
      versionMetadata.valueTimeLockAmountMultiplier;

    // Using the following formula:
    //  requiredLockAmount = normalizedfee * normalizedFeeMultipier * numberOfOps * valueTimeLockMultiplier
    //
    // We are going to find the numberOfOps given the requiredLockAmount
    const feePerOperation =
      valueTimeLock.normalizedFee * normalizedFeeToPerOperationFeeMultiplier;
    const numberOfOpsAllowed =
      valueTimeLock.amountLocked /
      (feePerOperation * valueTimeLockAmountMultiplier);

    // Make sure that we are returning an integer; rounding down to make sure that we are not going above
    // the max limit.
    const numberOfOpsAllowedInt = Math.floor(numberOfOpsAllowed);

    // Return at least the 'free' operations
    return Math.max(
      numberOfOpsAllowedInt,
      protocolParameters.maxNumberOfOperationsForNoValueTimeLock
    );
  }

  /**
   * Verifies that the value lock object (amount, transaction time range) is correct for the specified number
   * of operations.
   *
   * @param valueTimeLock The value time lock object used for verificiation.
   * @param numberOfOperations The target number of operations.
   * @param sidetreeTransactionTime The transaction time where the operations were written.
   * @param sidetreeTransactionWriter The writer of the transaction.
   * @param versionMetadataFetcher The mapper from transaction time to version metadata
   */
  public static verifyLockAmountAndThrowOnError(
    valueTimeLock: ValueTimeLockModel | undefined,
    numberOfOperations: number,
    sidetreeTransactionTime: number,
    sidetreeTransactionWriter: string,
    versionMetadataFetcher: IVersionMetadataFetcher
  ): void {
    // If the number of written operations were under the free limit then there's nothing to check
    if (
      numberOfOperations <=
      protocolParameters.maxNumberOfOperationsForNoValueTimeLock
    ) {
      return;
    }

    if (valueTimeLock) {
      // Check the lock owner
      if (valueTimeLock.owner !== sidetreeTransactionWriter) {
        throw new SidetreeError(
          ErrorCode.ValueTimeLockVerifierTransactionWriterLockOwnerMismatch,
          `Sidetree transaction writer: ${sidetreeTransactionWriter} - Lock owner: ${valueTimeLock.owner}`
        );
      }

      // Check the lock duration
      if (
        sidetreeTransactionTime < valueTimeLock.lockTransactionTime ||
        sidetreeTransactionTime >= valueTimeLock.unlockTransactionTime
      ) {
        throw new SidetreeError(
          ErrorCode.ValueTimeLockVerifierTransactionTimeOutsideLockRange,
          // tslint:disable-next-line: max-line-length
          `Sidetree transaction block: ${sidetreeTransactionTime}; lock start time: ${valueTimeLock.lockTransactionTime}; unlock time: ${valueTimeLock.unlockTransactionTime}`
        );
      }
    }

    const maxNumberOfOpsAllowed = this.calculateMaxNumberOfOperationsAllowed(
      valueTimeLock,
      versionMetadataFetcher
    );

    if (numberOfOperations > maxNumberOfOpsAllowed) {
      throw new SidetreeError(
        ErrorCode.ValueTimeLockVerifierInvalidNumberOfOperations,
        `Max number of ops allowed: ${maxNumberOfOpsAllowed}; actual number of ops: ${numberOfOperations}`
      );
    }
  }
}
