import ErrorCode from '@sidetree/common/src/errors/ErrorCode';
import ProtocolParameters from '../ProtocolParameters';
import SidetreeError from '@sidetree/common/src/errors/SidetreeError';
import ValueTimeLockModel from '@sidetree/common/src/models/ValueTimeLockModel';

/**
 * Encapsulates the functionality to compute and verify the value time lock amounts.
 */
export default class ValueTimeLockVerifier {
  /**
   * Calculates the maximum number of operations allowed to be written for the given lock information. If
   * there is no lock then it returns the number of operations which do not require a lock.
   *
   * @param valueTimeLock The lock object if exists
   */
  public static calculateMaxNumberOfOperationsAllowed(
    valueTimeLock: ValueTimeLockModel | undefined
  ) {
    if (valueTimeLock === undefined) {
      return ProtocolParameters.maxNumberOfOperationsForNoValueTimeLock;
    }

    return ProtocolParameters.maxNumberOfOperationsForNoValueTimeLock;
  }

  /**
   * Verifies that the value lock object (amount, transaction time range) is correct for the specified number
   * of operations.
   *
   * @param valueTimeLock The value time lock object used for verificiation.
   * @param numberOfOperations The target number of operations.
   * @param sidetreeTransactionTime The transaction time where the operations were written.
   * @param sidetreeTransactionWriter The writer of the transaction.
   */
  public static verifyLockAmountAndThrowOnError(
    valueTimeLock: ValueTimeLockModel | undefined,
    numberOfOperations: number,
    sidetreeTransactionTime: number,
    sidetreeTransactionWriter: string
  ): void {
    // If the number of written operations were under the free limit then there's nothing to check
    if (
      numberOfOperations <=
      ProtocolParameters.maxNumberOfOperationsForNoValueTimeLock
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
      valueTimeLock
    );

    if (numberOfOperations > maxNumberOfOpsAllowed) {
      throw new SidetreeError(
        ErrorCode.ValueTimeLockVerifierInvalidNumberOfOperations,
        `Max number of ops allowed: ${maxNumberOfOpsAllowed}; actual number of ops: ${numberOfOperations}`
      );
    }
  }
}
