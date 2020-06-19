import {
  DocumentModel,
  ErrorCode,
  PublicKeyModel,
  PublicKeyUsage,
  SidetreeError,
} from '@sidetree/common';
import jsonpatch, { Operation } from 'fast-json-patch';
import Document from './Document';
import UpdateOperation from './UpdateOperation';
import Jwk from './util/Jwk';

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
   * Applies the update operation to the given document.
   * @returns The resultant document.
   * @throws SidetreeError if invalid operation is given.
   */
  public static async applyUpdateOperation(
    operation: UpdateOperation,
    document: any
  ): Promise<any> {
    // The current document must contain the public key mentioned in the operation ...
    const publicKey = Document.getPublicKey(
      document,
      operation.signedDataJws.kid
    );
    DocumentComposer.validateOperationKey(publicKey);

    // Verify the signature.
    if (!(await operation.signedDataJws.verifySignature(publicKey!.jwk))) {
      throw new SidetreeError(ErrorCode.DocumentComposerInvalidSignature);
    }
    // The operation passes all checks, apply the patches.
    const resultantDocument = DocumentComposer.applyPatches(
      document,
      operation.delta!.patches
    );

    return resultantDocument;
  }

  /**
   * Ensures the given key is an operation key allowed to perform document modification.
   */
  private static validateOperationKey(publicKey: PublicKeyModel | undefined) {
    if (!publicKey) {
      throw new SidetreeError(ErrorCode.DocumentComposerKeyNotFound);
    }

    if (publicKey.type !== 'EcdsaSecp256k1VerificationKey2019') {
      throw new SidetreeError(
        ErrorCode.DocumentComposerOperationKeyTypeNotEs256k
      );
    }

    if (!publicKey.usage.includes(PublicKeyUsage.Ops)) {
      throw new SidetreeError(
        ErrorCode.DocumentComposerPublicKeyNotOperationKey
      );
    }

    Jwk.validateJwkEs256k(publicKey.jwk);
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
