import { JwkEs256k } from '@sidetree/common';
import CreateOperation from '../CreateOperation';
import DocumentComposer from '../DocumentComposer';
import Jwk from '../util/Jwk';
import OperationGenerator from './generators/OperationGenerator';
import didActorDidDocument from './__fixtures__/didActorDidDocument.json';
import simpleDidDocument from './__fixtures__/simpleDidDocument.json';

describe('Create operation', () => {
  let recoveryPublicKey: JwkEs256k;
  let nextUpdateCommitmentHash: string;

  beforeAll(async () => {
    [recoveryPublicKey, ,] = await Jwk.generateEs256kKeyPair();
    [
      ,
      nextUpdateCommitmentHash,
    ] = OperationGenerator.generateCommitRevealPair();
  });

  it('should contain a delta with valid ietf json patch', async () => {
    const operationRequest = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      simpleDidDocument
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
    const operationRequest = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      didActorDidDocument
    );
    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
    const createOperation = await CreateOperation.parse(operationBuffer);
    expect(createOperation).toBeDefined();
    const patches = createOperation.delta!.patches;
    const didDocument = DocumentComposer.applyPatches({}, patches);
    expect(didDocument).toEqual(didActorDidDocument);
  });
});
