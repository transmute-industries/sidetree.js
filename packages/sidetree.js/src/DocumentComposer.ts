import DocumentModel from './models/DocumentModel';
import ErrorCode from './errors/ErrorCode';
import SidetreeError from './errors/SidetreeError';
import DidStatePatch from './DidStatePatch';

/**
 * Class that handles the composition of operations into final external-facing document.
 */
export default class DocumentComposer {
  /**
   * Validates the schema of the given update document patch.
   * @throws SidetreeError if given document patch fails validation.
   */
  public static validateDocumentPatches(patches: any) {
    if (!Array.isArray(patches)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerUpdateOperationDocumentPatchesNotArray
      );
    }

    for (const patch of patches) {
      DocumentComposer.validatePatch(patch);
    }
  }

  private static validatePatch(patch: any) {
    const action = patch.action;
    switch (action) {
      case 'ietf-json-patch':
        DidStatePatch.validatePatch(patch);
        break;
      default:
        throw new SidetreeError(
          ErrorCode.DocumentComposerPatchMissingOrUnknownAction
        );
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
    if (patch.action === 'ieft-json-patch') {
      console.error(document, 'TODO');
    }
  }
}
