import jsonpatch, { Operation } from 'fast-json-patch';
import SidetreeError from './errors/SidetreeError';
import ErrorCode from './errors/ErrorCode';

// See https://identity.foundation/sidetree/spec/#did-state-patches
// We only support IETF's json patch: https://tools.ietf.org/html/rfc6902
enum supportedActions {
  IetfJsonPatch = 'ietf-json-patch',
}

interface IIetfJsonPatch {
  action: string;
  patches: Array<Operation>;
}

export default class DidStatePatch {
  public static generatePatch(before: Object, after: Object) {
    const patches = jsonpatch.compare(before, after);
    return {
      action: supportedActions.IetfJsonPatch,
      patches,
    };
  }

  public static validatePatch(patch: IIetfJsonPatch) {
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
}
