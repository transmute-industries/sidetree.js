import {
  ErrorCode,
  OperationModel,
  OperationType,
  SidetreeError,
} from '@sidetree/common';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import RecoverOperation from './RecoverOperation';
import UpdateOperation from './UpdateOperation';

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
    const isAnchorFileMode = false;

    if (operationType === OperationType.Create) {
      return CreateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Update) {
      return UpdateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Recover) {
      return RecoverOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Deactivate) {
      return DeactivateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else {
      throw new SidetreeError(ErrorCode.OperationTypeUnknownOrMissing);
    }
  }
}
