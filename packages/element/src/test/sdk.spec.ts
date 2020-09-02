import Element from '../Element';
import { getTestElement } from './utils';
import sdk from '../sdk';
import {
  PublicKeyJwk,
  PrivateKeyJwk,
  PublicKeyPurpose,
} from '@sidetree/common';
import { CreateOperation, UpdateOperation } from '@sidetree/core';

console.info = (): null => null;

describe('Element', () => {
  let element: Element;
  let mnemonic: string;
  // Create
  let didDocumentKey: [PublicKeyJwk, PrivateKeyJwk];
  let updateKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let recoveryKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let createOperation: CreateOperation;
  let did: string;
  // Update
  let newDidDocumentKey: [PublicKeyJwk, PrivateKeyJwk];
  let newUpdateKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let updateOperation: UpdateOperation;
  let document: Record<string, unknown>;

  beforeAll(async () => {
    element = await getTestElement();
  });

  afterAll(async () => {
    await element.close();
  });

  it('should generate key material', async () => {
    mnemonic = await sdk.Keys.generateMnemonic();
    expect(mnemonic).toBeDefined();
    didDocumentKey = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 0);
    expect(didDocumentKey[0]).toBeDefined();
    expect(didDocumentKey[1]).toBeDefined();
    updateKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 1);
    expect(updateKeyPair[0]).toBeDefined();
    expect(updateKeyPair[1]).toBeDefined();
    recoveryKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 2);
    expect(recoveryKeyPair[0]).toBeDefined();
    expect(recoveryKeyPair[1]).toBeDefined();
  });

  it('should generate create operation', async () => {
    document = {
      public_keys: [
        {
          id: 'primary',
          type: 'Ed25519VerificationKey2018',
          jwk: didDocumentKey[0],
          purpose: [PublicKeyPurpose.General],
        },
      ],
    };
    createOperation = await sdk.Operations.generateCreateOperation(
      updateKeyPair,
      recoveryKeyPair,
      document
    );
    expect(createOperation).toBeDefined();
  });

  it('should be a valid create operation', async () => {
    const operation = await element.handleOperationRequest(
      createOperation.operationBuffer
    );
    expect(operation.status).toBe('succeeded');
    did = operation.body.didDocument.id;
    await element.triggerBatchAndObserve();
    const response = await element.handleResolveRequest(did);
    expect(response.body.didDocument).toBeDefined();
    expect(response.body.didDocument.publicKey).toHaveLength(1);
    expect(response.body.didDocument.publicKey[0].publicKeyJwk).toEqual(
      didDocumentKey[0]
    );
  });

  it('should generate update operation', async () => {
    newDidDocumentKey = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 3);
    expect(didDocumentKey[0]).toBeDefined();
    expect(didDocumentKey[1]).toBeDefined();
    const newDocument = {
      public_keys: [
        {
          id: 'primary',
          type: 'Ed25519VerificationKey2018',
          jwk: newDidDocumentKey[0],
          purpose: [PublicKeyPurpose.General],
        },
      ],
    };
    newUpdateKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 4);
    expect(updateKeyPair[0]).toBeDefined();
    expect(updateKeyPair[1]).toBeDefined();
    const didUniqueSuffix = did.split(':').pop();
    updateOperation = await sdk.Operations.generateUpdateOperation(
      didUniqueSuffix!,
      updateKeyPair,
      newUpdateKeyPair,
      document,
      newDocument
    );
    expect(updateOperation).toBeDefined();
  });

  it('should be a valid update operation', async () => {
    const operation = await element.handleOperationRequest(
      updateOperation.operationBuffer
    );
    expect(operation.status).toBe('succeeded');
    await element.triggerBatchAndObserve();
    const response = await element.handleResolveRequest(did);
    expect(response.body.didDocument).toBeDefined();
    expect(response.body.didDocument.publicKey).toHaveLength(1);
    expect(response.body.didDocument.publicKey[0].publicKeyJwk).toEqual(
      newDidDocumentKey[0]
    );
  });
});
