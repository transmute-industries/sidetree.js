import {
  generateCreateOperation,
  ICreateOperationData,
} from './operations_helper';
import DocumentComposer from '../src/DocumentComposer';

describe('Create operation', () => {
  let createOperationData: ICreateOperationData;

  it('should contain a delta with valid ietf json patch', async () => {
    createOperationData = await generateCreateOperation();
    const delta = createOperationData.createOperation.delta!;
    expect(delta).toBeDefined();
    expect(delta.updateCommitment).toBeDefined();
    expect(delta.patches).toBeDefined();
    delta.patches.forEach((patch) => {
      expect(() => DocumentComposer.validatePatch(patch)).not.toThrow();
    });
  });
});
