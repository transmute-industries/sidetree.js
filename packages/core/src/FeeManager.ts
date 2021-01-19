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

import { ErrorCode, protocolParameters, SidetreeError } from '@sidetree/common';

/**
 * Encapsulates the functionality to calculate and verify the blockchain transaction fees.
 */
export default class FeeManager {
  /**
   * Converts the normalized fee (returned by the blockchain) into the transaction fee to be paid when writing
   * the current transaction.
   *
   * @param normalizedFee The normalized fee for the current transaction.
   * @param numberOfOperations The number of operations to write.
   * @param feeMarkupFactor Markup to be added to the calculated fee.
   *
   * @throws if the number of operations are <= 0.
   */
  public static computeMinimumTransactionFee(
    normalizedFee: number,
    numberOfOperations: number
  ): number {
    if (numberOfOperations <= 0) {
      throw new SidetreeError(
        ErrorCode.OperationCountLessThanZero,
        `Fee cannot be calculated for the given number of operations: ${numberOfOperations}`
      );
    }

    const feePerOperation =
      normalizedFee *
      protocolParameters.normalizedFeeToPerOperationFeeMultiplier;
    const feeForAllOperations = feePerOperation * numberOfOperations;

    // If our calculated-fee is lower than the normalized fee (which can happen if the number of operations is
    // very low) then the calculated-fee will be ignored by the blockchain miners ... so make sure that we
    // return at-least the normalized fee.
    const transactionFee = Math.max(feeForAllOperations, normalizedFee);

    return transactionFee;
  }

  /**
   * Verifies that the fee paid for the given transaction is valid; throws if it is not valid.
   *
   * @param transactionFeePaid The actual fee paid for that transaction.
   * @param numberOfOperations The number of operations written.
   * @param normalizedFee The normalized fee for that transaction.
   *
   * @throws if the number of operations is <= 0; if the feepaid is invalid.
   */
  public static verifyTransactionFeeAndThrowOnError(
    transactionFeePaid: number,
    numberOfOperations: number,
    normalizedFee: number
  ): void {
    // If there are no operations written then someone wrote incorrect data and we are going to throw
    if (numberOfOperations <= 0) {
      throw new SidetreeError(
        ErrorCode.OperationCountLessThanZero,
        `The number of operations: ${numberOfOperations} must be greater than 0`
      );
    }

    if (transactionFeePaid < normalizedFee) {
      throw new SidetreeError(
        ErrorCode.TransactionFeePaidLessThanNormalizedFee,
        `The actual fee paid: ${transactionFeePaid} should be greater than or equal to the normalized fee: ${normalizedFee}`
      );
    }

    const actualFeePerOperation = transactionFeePaid / numberOfOperations;
    const expectedFeePerOperation =
      normalizedFee *
      protocolParameters.normalizedFeeToPerOperationFeeMultiplier;

    if (actualFeePerOperation < expectedFeePerOperation) {
      throw new SidetreeError(
        ErrorCode.TransactionFeePaidInvalid,
        `The actual fee paid: ${transactionFeePaid} per number of operations: ${numberOfOperations} should be at least ${expectedFeePerOperation}.`
      );
    }
  }
}
