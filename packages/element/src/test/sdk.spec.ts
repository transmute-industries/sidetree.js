import Element from '../Element';
import { getTestElement } from './utils';
import sdk from '../sdk';
import {
  PublicKeyJwk,
  PrivateKeyJwk,
  PublicKeyPurpose,
} from '@sidetree/common';
import { CreateOperation } from '@sidetree/core';

console.info = (): null => null;

describe('Element', () => {
  let element: Element;
  let generalKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let updateKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let recoveryKeyPair: [PublicKeyJwk, PrivateKeyJwk];
  let createOperation: CreateOperation;

  beforeAll(async () => {
    element = await getTestElement();
  });

  afterAll(async () => {
    await element.close();
  });

  it('should generate key material', async () => {
    const mnemonic = await sdk.Keys.generateMnemonic();
    expect(mnemonic).toBeDefined();
    generalKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 0);
    expect(generalKeyPair[0]).toBeDefined();
    expect(generalKeyPair[1]).toBeDefined();
    updateKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 0);
    expect(updateKeyPair[0]).toBeDefined();
    expect(updateKeyPair[1]).toBeDefined();
    recoveryKeyPair = await sdk.Keys.generateKeyPairFromMnemonic(mnemonic, 0);
    expect(recoveryKeyPair[0]).toBeDefined();
    expect(recoveryKeyPair[1]).toBeDefined();
  });

  it('should generate create operation', async () => {
    const document = {
      public_keys: [
        {
          id: 'primary',
          type: 'Ed25519VerificationKey2018',
          jwk: generalKeyPair[0],
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
    expect(operation.body.didDocument).toBeDefined();
    expect(operation.body.didDocument.publicKey).toHaveLength(1);
    expect(operation.body.didDocument.publicKey[0].publicKeyJwk).toEqual(
      generalKeyPair[0]
    );
  });
});
