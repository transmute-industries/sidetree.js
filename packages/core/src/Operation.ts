import {
  ErrorCode,
  OperationType,
  OperationModel,
  SidetreeError,
} from '@sidetree/common';

import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import RecoverOperation from './RecoverOperation';
import UpdateOperation from './UpdateOperation';
import { validateDelta } from './validateDelta';

/**
 * A class that contains Sidetree operation utility methods.
 */
export default class Operation {
  /** Maximum allowed encoded reveal value string length. */
  public static readonly maxEncodedRevealValueLength = 50;

  /**
   * Parses the given buffer into an `OperationModel`.
   */
  public static async parse(operationBuffer: Buffer): Promise<OperationModel> {
    // Parse request buffer into a JS object.
    const operationJsonString = operationBuffer.toString();
    const operationObject = JSON.parse(operationJsonString);
    const operationType = operationObject.type;

    if (operationType === OperationType.Create) {
      return CreateOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Update) {
      return UpdateOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Recover) {
      return RecoverOperation.parseObject(operationObject, operationBuffer);
    } else if (operationType === OperationType.Deactivate) {
      return DeactivateOperation.parseObject(operationObject, operationBuffer);
    } else {
      throw new SidetreeError(ErrorCode.OperationTypeUnknownOrMissing);
    }
  }

  /**
   * validate delta and throw if invalid
   * @param delta the delta to validate
   */
  public static validateDelta(delta: any): void {
    validateDelta(delta);
  }
}
