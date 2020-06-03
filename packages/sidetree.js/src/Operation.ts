import DeltaModel from '@sidetree/common/src/models/DeltaModel';
import DocumentComposer from './DocumentComposer';
import Encoder from './util/Encoder';
import ErrorCode from './errors/ErrorCode';
import JsonAsync from './util/JsonAsync';
import Multihash from './util/Multihash';
import SidetreeError from './errors/SidetreeError';

/**
 * A class that contains Sidetree operation utility methods.
 */
export default class Operation {
  /** Maximum allowed encoded reveal value string length. */
  public static readonly maxEncodedRevealValueLength = 50;

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
