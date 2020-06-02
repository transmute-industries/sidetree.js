import {
  generateCommitRevealPair,
  generateKeyPair,
  generateCreateOperationRequest,
  generateCreateOperation,
  ICreateOperationData,
} from './operations_helper';
import DocumentComposer from '../src/DocumentComposer';
import CreateOperation from '../src/CreateOperation';
import Jwk from '../src/util/Jwk';

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

  it('should be able to pass arbitrary did document', async () => {
    const signingKeyId = 'signingKey';
    const [recoveryPublicKey, ,] = await Jwk.generateEs256kKeyPair();
    const [signingPublicKey] = await generateKeyPair(signingKeyId);
    const [, nextUpdateCommitmentHash] = generateCommitRevealPair();
    const arbitraryDocument = {
      arbitrary: true,
      nested: {
        property: 'work',
      },
      publicKeys: [signingPublicKey],
    };
    const operationRequest = await generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      arbitraryDocument
    );
    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
    const createOperation = await CreateOperation.parse(operationBuffer);
    expect(createOperation).toBeDefined();
    const patches = createOperation.delta!.patches;
    const didDocument = DocumentComposer.applyPatches({}, patches);
    expect(didDocument).toEqual(arbitraryDocument);
  });
});
