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

import { ErrorCode } from '@sidetree/common';
import FeeManager from '../FeeManager';
import JasmineSidetreeErrorValidator from './JasmineSidetreeErrorValidator';

describe('FeeManager', () => {
  describe('computeMinimumTransactionFee', () => {
    it('should return calculated fee if it is greater', async () => {
      const fee = FeeManager.computeMinimumTransactionFee(2, 10000);

      expect(fee).toEqual(200);
    });

    it('should return at least the normalized fee if the calculated fee is lower', async () => {
      const fee = FeeManager.computeMinimumTransactionFee(100, 1);

      expect(fee).toEqual(100);
    });

    it('should fail if the number of operations is <= 0', async () => {
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => FeeManager.computeMinimumTransactionFee(100, 0),
        ErrorCode.OperationCountLessThanZero
      );

      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => FeeManager.computeMinimumTransactionFee(100, -1),
        ErrorCode.OperationCountLessThanZero
      );
    });
  });

  describe('verifyTransactionFeeAndThrowOnError', () => {
    it('should not throw if the fee paid is at least the expected fee', async () => {
      try {
        const feeToPay = FeeManager.computeMinimumTransactionFee(100, 100);
        FeeManager.verifyTransactionFeeAndThrowOnError(feeToPay, 100, 100);
      } catch (e) {
        fail();
      }
    });

    it('should not throw if the fee paid is at least the expected fee (0% markup)', async () => {
      try {
        const feeToPay = FeeManager.computeMinimumTransactionFee(100, 100);
        FeeManager.verifyTransactionFeeAndThrowOnError(feeToPay, 100, 100);
      } catch (e) {
        fail();
      }
    });

    it('should throw if the fee paid is less than the expected fee', async () => {
      const feeToPay = FeeManager.computeMinimumTransactionFee(100, 100);

      // Make the next call w/ a large number of operations to simulate the error condition.
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () =>
          FeeManager.verifyTransactionFeeAndThrowOnError(feeToPay, 1000, 100),
        ErrorCode.TransactionFeePaidInvalid
      );
    });

    it('should throw if the fee paid is less than the normalized fee', async () => {
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => FeeManager.verifyTransactionFeeAndThrowOnError(99, 10, 100),
        ErrorCode.TransactionFeePaidLessThanNormalizedFee
      );
    });

    it('should throw if the number of operations are <= 0', async () => {
      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => FeeManager.verifyTransactionFeeAndThrowOnError(101, 0, 10),
        ErrorCode.OperationCountLessThanZero
      );

      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => FeeManager.verifyTransactionFeeAndThrowOnError(101, -1, 10),
        ErrorCode.OperationCountLessThanZero
      );
    });
  });
});
