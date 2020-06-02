import {
  generateCommitRevealPair,
  generateKeyPair,
  generateCreateOperationRequest,
} from './operations_helper';
import DocumentComposer from '../src/DocumentComposer';
import CreateOperation from '../src/CreateOperation';
import Jwk from '../src/util/Jwk';
import PublicKeyModel from 'models/PublicKeyModel';
import JwkEs256k from 'models/JwkEs256k';

describe('Create operation', () => {
  let recoveryPublicKey: JwkEs256k;
  let signingPublicKey: PublicKeyModel;
  let nextUpdateCommitmentHash: string;

  beforeAll(async () => {
    const signingKeyId = 'signingKey';
    [recoveryPublicKey, ,] = await Jwk.generateEs256kKeyPair();
    [signingPublicKey] = await generateKeyPair(signingKeyId);
    [, nextUpdateCommitmentHash] = generateCommitRevealPair();
  });

  it('should contain a delta with valid ietf json patch', async () => {
    const didDocument = {
      publicKeys: [signingPublicKey],
    };
    const operationRequest = await generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      didDocument
    );
    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
    const createOperation = await CreateOperation.parse(operationBuffer);
    const delta = createOperation.delta!;
    expect(delta).toBeDefined();
    expect(delta.updateCommitment).toBeDefined();
    expect(delta.patches).toBeDefined();
    delta.patches.forEach((patch) => {
      expect(() => DocumentComposer.validatePatch(patch)).not.toThrow();
    });
  });

  it('should be able to create an arbitrary did document', async () => {
    const arbitraryDocument = {
      arbitrary: true,
      nested: {
        property: 'is possible',
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
