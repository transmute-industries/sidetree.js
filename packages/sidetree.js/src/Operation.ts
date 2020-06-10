import DeltaModel from '@sidetree/common/src/models/DeltaModel';
import OperationModel from '@sidetree/common/src/models/OperationModel';
import OperationType from '@sidetree/common/src/enums/OperationType';
import DocumentComposer from './DocumentComposer';
import Encoder from '@sidetree/common/src/util/Encoder';
import ErrorCode from '@sidetree/common/src/errors/ErrorCode';
import JsonAsync from './util/JsonAsync';
import Multihash from './util/Multihash';
import SidetreeError from '@sidetree/common/src/errors/SidetreeError';
import CreateOperation from './CreateOperation';
import UpdateOperation from './UpdateOperation';
import RecoverOperation from './RecoverOperation';
import DeactivateOperation from './DeactivateOperation';

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

  /**
   * Parses the given encoded delta string into an internal `DeltaModel`.
   */
  public static async parseDelta(deltaEncodedString: any): Promise<DeltaModel> {
    if (typeof deltaEncodedString !== 'string') {
      throw new SidetreeError(ErrorCode.DeltaMissingOrNotString);
    }

    const deltaJsonString = Encoder.decodeAsString(deltaEncodedString);
    const delta = await JsonAsync.parse(deltaJsonString);

    const properties = Object.keys(delta);
    if (properties.length !== 2) {
      throw new SidetreeError(ErrorCode.DeltaMissingOrUnknownProperty);
    }

    if (delta.patches === undefined) {
      throw new SidetreeError(ErrorCode.OperationDocumentPatchesMissing);
    }

    // Validate `patches` property using the DocumentComposer.
    DocumentComposer.validateDocumentPatches(delta.patches);

    const nextUpdateCommitment = Encoder.decodeAsBuffer(
      delta.update_commitment
    );
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(
      nextUpdateCommitment
    );

    return {
      patches: delta.patches,
      updateCommitment: delta.update_commitment,
    };
  }
}
