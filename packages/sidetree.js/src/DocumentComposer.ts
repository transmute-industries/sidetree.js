import jsonpatch, { Operation } from 'fast-json-patch';
import ErrorCode from './errors/ErrorCode';
import SidetreeError from './errors/SidetreeError';
import DocumentModel from './models/DocumentModel';

// See https://identity.foundation/sidetree/spec/#did-state-patches
// We only support IETF's json patch: https://tools.ietf.org/html/rfc6902
enum supportedActions {
  IetfJsonPatch = 'ietf-json-patch',
}

interface IIetfJsonPatch {
  action: string;
  patches: Array<Operation>;
}

/**
 * Class that handles the composition of operations into final external-facing document.
 */
export default class DocumentComposer {
  public static generatePatch(before: Object, after: Object): IIetfJsonPatch {
    const patches = jsonpatch.compare(before, after);
    return {
      action: supportedActions.IetfJsonPatch,
      patches,
    };
  }

  /**
   * Validates the schema of the given update document patch.
   * @throws SidetreeError if given document patch fails validation.
   */
  public static validateDocumentPatches(patches: any): void {
    if (!Array.isArray(patches)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerUpdateOperationDocumentPatchesNotArray
      );
    }

    for (const patch of patches) {
      DocumentComposer.validatePatch(patch);
    }
  }

  public static validatePatch(patch: any) {
    const action = patch.action;
    switch (action) {
      case 'ietf-json-patch':
        DocumentComposer.validateIetfJsonPatch(patch);
        break;
      default:
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchMissingOrUnknownAction
        );
    }
  }

  private static validateIetfJsonPatch(patch: IIetfJsonPatch): void {
    const patchProperties = Object.keys(patch);
    if (patchProperties.length !== 2) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchMissingOrUnknownProperty
      );
    }
    if (patch.action !== supportedActions.IetfJsonPatch) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPatchMissingOrUnknownAction
      );
    }
    const error = jsonpatch.validate(patch.patches);
    if (error) {
      console.warn(error);
      throw new SidetreeError(error.name);
    }
  }

  /**
   * Applies the given patches in order to the given document.
   * NOTE: Assumes no schema validation is needed, since validation should've already occurred at the time of the operation being parsed.
   * @returns The resultant document.
   */
  public static applyPatches(document: any, patches: any[]): any {
    // Loop through and apply all patches.
    let resultantDocument = document;
    for (const patch of patches) {
      resultantDocument = DocumentComposer.applyPatchToDidDocument(
        resultantDocument,
        patch
      );
    }

    return resultantDocument;
  }

  /**
   * Applies the given patch to the given DID Document.
   */
  private static applyPatchToDidDocument(
    document: DocumentModel,
    patch: any
  ): any {
    DocumentComposer.validateIetfJsonPatch(patch);
    const res = jsonpatch.applyPatch({ ...document }, patch.patches);
    return res.newDocument;
  }
}
