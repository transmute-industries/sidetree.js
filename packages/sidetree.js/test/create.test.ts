import {
  generateCreateOperation,
  ICreateOperationData,
} from './operations_helper';
import DidStatePatch from '../src/DidStatePatch';

describe('Create operation', () => {
  let createOperationData: ICreateOperationData;

  it('should contain a delta with valid ietf json patch', async () => {
    createOperationData = await generateCreateOperation();
    const delta = createOperationData.createOperation.delta!;
    expect(delta).toBeDefined();
    expect(delta.updateCommitment).toBeDefined();
    expect(delta.patches).toBeDefined();
    delta.patches.forEach((patch) => {
      expect(() => DidStatePatch.validatePatch(patch)).not.toThrow();
    });
  });
});
