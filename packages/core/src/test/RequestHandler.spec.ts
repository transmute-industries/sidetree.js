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

/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-standalone-expect */
import * as crypto from 'crypto';
import {
  AnchoredOperationModel,
  DidState,
  Encoder,
  ErrorCode,
  ICas,
  IOperationStore,
  IVersionManager,
  PublicKeyJwk,
  OperationType,
  Config,
  SidetreeError,
  ResponseStatus,
  PrivateKeyJwk,
} from '@sidetree/common';
import BatchScheduler from '../write/BatchScheduler';
import BatchWriter from '../write/BatchWriter';
import ChunkFile from '../write/ChunkFile';
import CreateOperation from '../CreateOperation';
import Did from '../Did';
import Compressor from '../util/Compressor';
import JsonAsync from '../util/JsonAsync';
import Jwk from '../util/Jwk';
import { MockLedger } from '@sidetree/ledger';
import { MockCas } from '@sidetree/cas';
import MockOperationQueue from './mocks/MockOperationQueue';
import MockOperationStore from './mocks/MockOperationStore';
import MockVersionManager from './mocks/MockVersionManager';
import Operation from '../Operation';
import OperationGenerator from './generators/OperationGenerator';
import OperationProcessor from '../OperationProcessor';
import RequestHandler from '../RequestHandler';
import Resolver from '../Resolver';
import Response from '../Response';

jest.setTimeout(10 * 1000);

const util = require('util');

describe('RequestHandler', () => {
  // Surpress console logging during dtesting so we get a compact test summary in console.
  console.info = (): null => null;
  console.error = () => null;
  console.debug = () => null;

  const config: Config = require('./config-test.json');
  const didMethodName = config.didMethodName;

  // Load the DID Document template.
  const blockchain = new MockLedger();
  let cas: ICas;
  let batchScheduler: BatchScheduler;
  let operationStore: IOperationStore;
  let resolver: Resolver;
  let requestHandler: RequestHandler;
  let versionManager: IVersionManager;

  let recoveryPublicKey: PublicKeyJwk;
  let recoveryPrivateKey: PrivateKeyJwk;
  let did: string; // This DID is created at the beginning of every test.
  let didUniqueSuffix: string;

  // Start a new instance of Operation Processor, and create a DID before every test.
  beforeEach(async () => {
    const operationQueue = new MockOperationQueue();
    spyOn(blockchain, 'getFee').and.returnValue(Promise.resolve(100));
    spyOn(blockchain, 'getWriterValueTimeLock').and.returnValue(
      Promise.resolve(undefined)
    );

    let versionMetadataFetcher: any = {};
    const versionMetadata = {
      normalizedFeeToPerOperationFeeMultiplier: 0.01,
    };
    versionMetadataFetcher = {
      getVersionMetadata: () => {
        return versionMetadata;
      },
    };
    cas = new MockCas();
    const batchWriter = new BatchWriter(
      operationQueue,
      blockchain,
      cas,
      versionMetadataFetcher
    );
    const operationProcessor = new OperationProcessor();

    versionManager = new MockVersionManager();
    spyOn(versionManager, 'getOperationProcessor').and.returnValue(
      operationProcessor
    );
    spyOn(versionManager, 'getBatchWriter').and.returnValue(batchWriter);

    operationStore = new MockOperationStore();
    resolver = new Resolver(versionManager, operationStore);
    batchScheduler = new BatchScheduler(
      versionManager,
      blockchain,
      config.batchingIntervalInSeconds
    );
    requestHandler = new RequestHandler(
      resolver,
      operationQueue,
      didMethodName
    );

    // Set a latest time that must be able to resolve to a protocol version in the protocol config file used.
    const mockLatestTime = {
      time: 1000000,
      hash: 'dummyHash',
    };

    blockchain.setLatestTime(mockLatestTime);

    // Generate a unique key-pair used for each test.
    [
      recoveryPublicKey,
      recoveryPrivateKey,
    ] = await Jwk.generateEd25519KeyPair();
    const [signingPublicKey] = await OperationGenerator.generateKeyPair('key2');
    const services = OperationGenerator.generateServiceEndpoints([
      'serviceEndpointId123',
    ]);
    const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
      recoveryPublicKey,
      signingPublicKey,
      services
    );
    const createOperation = await CreateOperation.parse(createOperationBuffer);
    didUniqueSuffix = createOperation.didUniqueSuffix;
    did = `did:${didMethodName}:${didUniqueSuffix}`;

    // Test that the create request gets the correct response.
    const response = await requestHandler.handleOperationRequest(
      createOperationBuffer
    );
    const httpStatus = Response.toHttpStatus(response.status);
    expect(httpStatus).toEqual(200);
    expect(response).toBeDefined();
    expect(response.body.didDocument.id).toEqual(did);

    // Inser the create operation into DB.
    const namedAnchoredCreateOperationModel: AnchoredOperationModel = {
      didUniqueSuffix: createOperation.didUniqueSuffix,
      type: OperationType.Create,
      transactionNumber: 1,
      transactionTime: 1,
      operationBuffer: createOperationBuffer,
      operationIndex: 0,
    };
    await operationStore.put([namedAnchoredCreateOperationModel]);

    // Trigger the batch writing to clear the operation queue for future tests.
    await batchScheduler.writeOperationBatch();
  });

  it('should queue operation request and have it processed by the batch scheduler correctly.', async () => {
    const createOperationData = await OperationGenerator.generateAnchoredCreateOperation(
      { operationIndex: 1, transactionNumber: 1, transactionTime: 1 }
    );
    const createOperationBuffer =
      createOperationData.anchoredOperationModel.operationBuffer;
    await requestHandler.handleOperationRequest(createOperationBuffer);

    const blockchainWriteSpy = spyOn(blockchain, 'write');

    await batchScheduler.writeOperationBatch();
    expect(blockchainWriteSpy).toHaveBeenCalledTimes(1);

    // Verfiy that CAS was invoked to store the chunk file.
    const expectedBatchBuffer = await ChunkFile.createBuffer(
      [createOperationData.createOperation],
      [],
      []
    );
    const expectedChunkFileHash = await MockCas.getAddress(expectedBatchBuffer);
    const fetchResult = await cas.read(expectedChunkFileHash);
    const decompressedData = await Compressor.decompress(fetchResult.content!);
    const chunkFile = JSON.parse(decompressedData.toString());
    expect(chunkFile.deltas.length).toEqual(1);
  });

  it('should return bad request if delta given in request is larger than protocol limit.', async () => {
    const createOperationData = await OperationGenerator.generateCreateOperation();
    const createOperationRequest = createOperationData.operationRequest;
    const getRandomBytesAsync = util.promisify(crypto.randomBytes);
    const largeBuffer = await getRandomBytesAsync(4000);
    createOperationRequest.delta = Encoder.encode(largeBuffer);

    const createOperationBuffer = Buffer.from(
      JSON.stringify(createOperationRequest)
    );
    const response = await requestHandler.handleOperationRequest(
      createOperationBuffer
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(400);
    expect(response.body.code).toEqual(
      ErrorCode.RequestHandlerDeltaExceedsMaximumSize
    );
  });

  it('should return bad request if two operations for the same DID is received.', async () => {
    // Create the initial create operation.
    const [recoveryPublicKey] = await Jwk.generateEd25519KeyPair();
    const [signingPublicKey] = await OperationGenerator.generateKeyPair(
      'signingKey'
    );
    const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
      recoveryPublicKey,
      signingPublicKey
    );

    // Submit the create request twice.
    await requestHandler.handleOperationRequest(createOperationBuffer);
    const response = await requestHandler.handleOperationRequest(
      createOperationBuffer
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(400);
    expect(response.body.code).toEqual(
      ErrorCode.QueueingMultipleOperationsPerDidNotAllowed
    );
  });

  it('should return a correctly resolved DID Document given a known DID.', async () => {
    const response = await requestHandler.handleResolveRequest(did);
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(200);
    expect(response.body).toBeDefined();

    validateDidReferencesInDidDocument(response.body.didDocument, did);
  });

  it('should return a resolved DID Document given a valid long-form DID.', async () => {
    // Create a long-form DID string.
    const createOperationData = await OperationGenerator.generateCreateOperation();
    const didMethodName = 'sidetree';
    const didUniqueSuffix = createOperationData.createOperation.didUniqueSuffix;
    const encodedSuffixData =
      createOperationData.createOperation.encodedSuffixData;
    const encodedDelta = createOperationData.createOperation.encodedDelta;
    const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
    const longFormDid = `${shortFormDid}?-sidetree-initial-state=${encodedSuffixData}.${encodedDelta}`;

    const response = await requestHandler.handleResolveRequest(longFormDid);
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(200);
    expect(response.body).toBeDefined();

    validateDidReferencesInDidDocument(response.body.didDocument, shortFormDid);
  });

  it('should return NotFound given an unknown DID.', async () => {
    const response = await requestHandler.handleResolveRequest(
      'did:sidetree:EiAgE-q5cRcn4JHh8ETJGKqaJv1z2OgjmN3N-APx0aAvHg'
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(404);
    expect(response.body).toBeUndefined();
  });

  it('should return BadRequest given a malformed DID.', async () => {
    const response = await requestHandler.handleResolveRequest(
      'did:sidetree:EiAgE-q5cRcn4JHh8ETJGKqaJv1z2OgjmN3N-APx0aAvHg?bad-request-param=bad-input'
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(400);
    expect(response.body.code).toEqual(
      ErrorCode.DidLongFormOnlyInitialStateParameterIsAllowed
    );
  });

  it('should respond with HTTP 200 when DID deactivate operation request is successful.', async () => {
    const deactivateOperationData = await OperationGenerator.createDeactivateOperation(
      didUniqueSuffix,
      recoveryPrivateKey
    );
    const response = await requestHandler.handleOperationRequest(
      deactivateOperationData.operationBuffer
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(200);
  });

  it('should respond with HTTP 200 when an update operation request is successful.', async () => {
    const [, anySigningPrivateKey] = await Jwk.generateEd25519KeyPair();
    const [additionalKey] = await OperationGenerator.generateKeyPair(
      `new-key1`
    );
    const [signingPublicKey] = await OperationGenerator.generateKeyPair(
      'signingKey'
    );
    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
      didUniqueSuffix,
      signingPublicKey.jwk,
      anySigningPrivateKey,
      additionalKey,
      OperationGenerator.generateRandomHash()
    );

    const requestBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
    const response = await requestHandler.handleOperationRequest(requestBuffer);
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(200);
  });

  it('should respond with HTTP 200 when a recover operation request is successful.', async () => {
    const recoveryOperationData = await OperationGenerator.generateRecoverOperation(
      { didUniqueSuffix, recoveryPrivateKey }
    );
    const response = await requestHandler.handleOperationRequest(
      recoveryOperationData.operationBuffer
    );
    const httpStatus = Response.toHttpStatus(response.status);

    expect(httpStatus).toEqual(200);
  });

  describe('handleResolveRequest()', () => {
    it('should return internal server error if non-Sidetree error has occurred.', async () => {
      spyOn(Did, 'create').and.throwError('Non-Sidetree error.');

      const response = await requestHandler.handleResolveRequest('unused');

      expect(response.status).toEqual(ResponseStatus.ServerError);
    });
  });

  describe('handleOperationRequest()', () => {
    it('should return `BadRequest` if unknown error is thrown during generic operation parsing stage.', async () => {
      spyOn(JsonAsync, 'parse').and.throwError('Non-Sidetree error.');

      const response = await requestHandler.handleOperationRequest(
        Buffer.from('unused')
      );

      expect(response.status).toEqual(ResponseStatus.BadRequest);
    });

    it('should return `BadRequest` if operation of an unknown type is given.', async () => {
      // Simulate an unknown operation type.
      const mockCreateOperation = (
        await OperationGenerator.generateCreateOperation()
      ).createOperation;
      (mockCreateOperation as any).type = 'unknownType';
      spyOn(JsonAsync, 'parse').and.returnValue(Promise.resolve('unused'));
      spyOn(Operation, 'parse').and.returnValue(
        Promise.resolve(mockCreateOperation)
      );

      const response = await requestHandler.handleOperationRequest(
        Buffer.from('unused')
      );

      expect(response.status).toEqual(ResponseStatus.BadRequest);
      expect(response.body.code).toEqual(
        ErrorCode.RequestHandlerUnknownOperationType
      );
    });

    it('should return `BadRequest` if Sidetree error is thrown during operation processing stage.', async () => {
      // Simulate a Sidetree error thrown when processing operation.
      const mockErrorCode = 'anyCode';
      spyOn(requestHandler as any, 'applyCreateOperation').and.callFake(() => {
        throw new SidetreeError(mockErrorCode);
      });

      const operationBuffer = (
        await OperationGenerator.generateCreateOperation()
      ).createOperation.operationBuffer;
      const response = await requestHandler.handleOperationRequest(
        operationBuffer
      );

      expect(response.status).toEqual(ResponseStatus.BadRequest);
      expect(response.body.code).toEqual(mockErrorCode);
    });

    it('should return `ServerError` if non-Sidetree error is thrown during operation processing stage.', async () => {
      // Simulate a non-Sidetree error thrown when processing operation.
      spyOn(requestHandler as any, 'applyCreateOperation').and.throwError(
        'any error'
      );

      const operationBuffer = (
        await OperationGenerator.generateCreateOperation()
      ).createOperation.operationBuffer;
      const response = await requestHandler.handleOperationRequest(
        operationBuffer
      );

      expect(response.status).toEqual(ResponseStatus.ServerError);
    });
  });

  describe('handleCreateRequest()', () => {
    it('should return `BadRequest` if unable to generate initial DID state from the given create operation model.', async () => {
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const createOperation = createOperationData.createOperation;

      // Simulate undefined being returned by `applyCreateOperation()`.
      spyOn(requestHandler as any, 'applyCreateOperation').and.returnValue(
        Promise.resolve(undefined)
      );

      const response = await (requestHandler as any).handleCreateRequest(
        createOperation
      );

      expect(response.status).toEqual(ResponseStatus.BadRequest);
    });
  });

  describe('resolveLongFormDid()', () => {
    it('should return the resolved DID document if it is resolvable as a registered DID.', async () => {
      const [anySigningPublicKey] = await OperationGenerator.generateKeyPair(
        'anySigningKey'
      );
      const document = {
        public_keys: [anySigningPublicKey],
      };
      const mockedResolverReturnedDidState: DidState = {
        document,
        lastOperationTransactionNumber: 123,
        nextRecoveryCommitmentHash: 'anyCommitmentHash',
        nextUpdateCommitmentHash: 'anyCommitmentHash',
      };
      spyOn((requestHandler as any).resolver, 'resolve').and.returnValue(
        Promise.resolve(mockedResolverReturnedDidState)
      );

      const didState = await (requestHandler as any).resolveLongFormDid(
        'unused'
      );

      expect(didState.document.public_keys.length).toEqual(1);
      expect(didState.document.public_keys[0].jwk).toEqual(
        anySigningPublicKey.jwk
      );
    });
  });
});

// TODO: Move this to test utilities
/**
 * Verifies that the given DID document contains correct references to the DID throughout.
 */
function validateDidReferencesInDidDocument(didDocument: any, did: string) {
  expect(didDocument.id).toEqual(did);

  if (didDocument.publicKey) {
    for (const publicKeyEntry of didDocument.publicKey) {
      expect(publicKeyEntry.controller).toEqual(didDocument.id);
      expect((publicKeyEntry.id as string).startsWith('#'));
    }
  }

  if (didDocument.service) {
    for (const serviceEntry of didDocument.service) {
      expect((serviceEntry.id as string).startsWith('#'));
    }
  }
}
