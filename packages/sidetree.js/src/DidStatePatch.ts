import jsonpatch from 'fast-json-patch';

// See https://identity.foundation/sidetree/spec/#did-state-patches
// We only support IETF's json patch: https://tools.ietf.org/html/rfc6902
enum supportedActions {
  IetfJsonPatch = 'ietf-json-patch',
}

export default class DidStatePatch {
  public static generatePatch(before: Object, after: Object) {
    const patches = jsonpatch.compare(before, after);
    return {
      action: supportedActions.IetfJsonPatch,
      patches,
    };
  }
}
