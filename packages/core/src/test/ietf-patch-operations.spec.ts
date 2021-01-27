/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import IetfOperationGenerator from './generators/IetfOperationGenerator';
import {
  OperationType,
  DidState,
  IOperationProcessor,
  IOperationStore,
} from '@sidetree/common';
import OperationProcessor from '../OperationProcessor';
import Resolver from '../Resolver';
import MockOperationStore from './mocks/MockOperationStore';
import MockVersionManager from './mocks/MockVersionManager';

console.info = (): null => null;

describe('IETF Patch operations', () => {
  let resolver: Resolver;
  let operationProcessor: IOperationProcessor;
  let operationStore: IOperationStore;
  let createData: any;
  let recoverData: any;
  let currentDocument: any;

  beforeAll(async () => {
    // Make sure the mock version manager always returns the same operation processor in the test.
    operationProcessor = new OperationProcessor();
    const versionManager = new MockVersionManager();
    const spy = jest.spyOn(versionManager, 'getOperationProcessor');
    spy.mockReturnValue(operationProcessor);

    operationStore = new MockOperationStore();
    resolver = new Resolver(versionManager, operationStore);
  });

  it('should create a did document', async () => {
    createData = await IetfOperationGenerator.generateCreateOperation();
    const { didUniqueSuffix, operationBuffer } = createData.createOperation;
    const anchoredOperationModel = {
      type: OperationType.Create,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 1,
      transactionTime: 1,
      operationIndex: 1,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(1);
    expect(currentDocument.publicKey[0].id).toBe('signingKey');
    expect(currentDocument.service.length).toEqual(1);
  });

  it('should add a key to a did document', async () => {
    const updateData = await IetfOperationGenerator.generateUpdateOperation(
      createData.createOperation.didUniqueSuffix,
      createData.updatePublicKey,
      createData.updatePrivateKey
    );
    const { didUniqueSuffix, operationBuffer } = updateData.updateOperation;
    const anchoredOperationModel = {
      type: OperationType.Update,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 2,
      transactionTime: 2,
      operationIndex: 2,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(2);
    expect(currentDocument.publicKey[0].id).toBe('signingKey');
    expect(currentDocument.publicKey[1].id).toBe('additional-key');
    expect(currentDocument.service.length).toEqual(1);
  });

  it('should recover a did document', async () => {
    recoverData = await IetfOperationGenerator.generateRecoverOperation(
      createData.createOperation.didUniqueSuffix,
      createData.recoveryPrivateKey
    );
    const { didUniqueSuffix, operationBuffer } = recoverData.recoverOperation;
    const anchoredOperationModel = {
      type: OperationType.Recover,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 3,
      transactionTime: 3,
      operationIndex: 3,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(1);
    expect(currentDocument.publicKey[0].id).toBe('newKey');
    expect(currentDocument.service.length).toEqual(1);
  });

  it('should not deactivate a did document if wrong recovery key is passed', async () => {
    const deactivateData = await IetfOperationGenerator.createDeactivateOperation(
      createData.createOperation.didUniqueSuffix,
      // old recovery key
      createData.recoveryPrivateKey
    );
    const {
      didUniqueSuffix,
      operationBuffer,
    } = deactivateData.deactivateOperation;
    const anchoredOperationModel = {
      type: OperationType.Deactivate,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 4,
      transactionTime: 4,
      operationIndex: 4,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    expect(didState.nextRecoveryCommitmentHash).toBeDefined();
    expect(didState.nextUpdateCommitmentHash).toBeDefined();
  });

  it('should deactivate a did document', async () => {
    const deactivateData = await IetfOperationGenerator.createDeactivateOperation(
      createData.createOperation.didUniqueSuffix,
      recoverData.recoveryPrivateKey
    );
    const {
      didUniqueSuffix,
      operationBuffer,
    } = deactivateData.deactivateOperation;
    const anchoredOperationModel = {
      type: OperationType.Deactivate,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 5,
      transactionTime: 5,
      operationIndex: 5,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    expect(didState.nextRecoveryCommitmentHash).not.toBeDefined();
    expect(didState.nextUpdateCommitmentHash).not.toBeDefined();
  });
});

describe('Recover a DID document after a bad update', () => {
  let resolver: Resolver;
  let operationProcessor: IOperationProcessor;
  let operationStore: IOperationStore;
  let createData: any;
  let recoverData: any;
  let currentDocument: any;

  beforeAll(async () => {
    // Make sure the mock version manager always returns the same operation processor in the test.
    operationProcessor = new OperationProcessor();
    const versionManager = new MockVersionManager();
    const spy = jest.spyOn(versionManager, 'getOperationProcessor');
    spy.mockReturnValue(operationProcessor);

    operationStore = new MockOperationStore();
    resolver = new Resolver(versionManager, operationStore);
  });

  it('should create a did document', async () => {
    createData = await IetfOperationGenerator.generateCreateOperation();
    const { didUniqueSuffix, operationBuffer } = createData.createOperation;
    const anchoredOperationModel = {
      type: OperationType.Create,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 1,
      transactionTime: 1,
      operationIndex: 1,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(1);
    expect(currentDocument.publicKey[0].id).toBe('signingKey');
    expect(currentDocument.service.length).toEqual(1);
  });

  it('should update to remove all the keys from the did document', async () => {
    const updateData = await IetfOperationGenerator.generateBadUpdateOperation(
      createData.createOperation.didUniqueSuffix,
      createData.updatePublicKey,
      createData.updatePrivateKey,
      currentDocument
    );
    const { didUniqueSuffix, operationBuffer } = updateData.updateOperation;
    const anchoredOperationModel = {
      type: OperationType.Update,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 2,
      transactionTime: 2,
      operationIndex: 2,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(0);
    expect(currentDocument.service).not.toBeDefined();
  });

  it('should recover a did document', async () => {
    recoverData = await IetfOperationGenerator.generateRecoverOperation(
      createData.createOperation.didUniqueSuffix,
      createData.recoveryPrivateKey
    );
    const { didUniqueSuffix, operationBuffer } = recoverData.recoverOperation;
    const anchoredOperationModel = {
      type: OperationType.Recover,
      didUniqueSuffix,
      operationBuffer,
      transactionNumber: 3,
      transactionTime: 3,
      operationIndex: 3,
    };

    await operationStore.put([anchoredOperationModel]);
    const didState = (await resolver.resolve(didUniqueSuffix)) as DidState;
    currentDocument = didState.document;
    expect(currentDocument.publicKey.length).toEqual(1);
    expect(currentDocument.publicKey[0].id).toBe('newKey');
    expect(currentDocument.service.length).toEqual(1);
  });
});
