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

import {
  AnchoredOperationModel,
  Encoder,
  PublicKeyJwk,
  Multihash,
  OperationModel,
  OperationType,
  PrivateKeyJwk,
  PublicKeyModel,
  ServiceEndpointModel,
  PublicKeyPurpose,
  DocumentModel,
  PrivateKeyJwkEd25519,
} from '@sidetree/common';
import * as crypto from 'crypto';
import CreateOperation from '../../CreateOperation';
import DeactivateOperation from '../../DeactivateOperation';
import RecoverOperation from '../../RecoverOperation';
import UpdateOperation from '../../UpdateOperation';
import Jwk from '../../util/Jwk';
import Jws from '../../util/Jws';

interface AnchoredCreateOperationGenerationInput {
  transactionNumber: number;
  transactionTime: number;
  operationIndex: number;
}

interface RecoverOperationGenerationInput {
  didUniqueSuffix: string;
  recoveryPrivateKey: PrivateKeyJwk;
}

interface GeneratedRecoverOperationData {
  operationBuffer: Buffer;
  recoverOperation: RecoverOperation;
  recoveryPublicKey: PublicKeyJwk;
  recoveryPrivateKey: PrivateKeyJwk;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: PrivateKeyJwk;
  update_key: PublicKeyModel;
  updatePrivateKey: PrivateKeyJwk;
}

/**
 * A class that can generate valid operations.
 * Mainly useful for testing purposes.
 */
export default class OperationGenerator {
  /**
   * Generates random hash.
   */
  public static generateRandomHash(): string {
    const randomBuffer = crypto.randomBytes(32);
    const randomHash = Encoder.encode(Multihash.hash(randomBuffer));

    return randomHash;
  }

  /**
   * Generates Ed25519 key pair to be used in an operation. If purpose not supplied, all purposes will be included
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateKeyPair(
    id: string,
    purpose?: PublicKeyPurpose[]
  ): Promise<[PublicKeyModel, PrivateKeyJwk]> {
    const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();
    const publicKeyModel = {
      id,
      type: 'Ed25519VerificationKey2018',
      jwk: publicKey,
      purpose: purpose || Object.values(PublicKeyPurpose),
    };

    return [publicKeyModel, privateKey];
  }

  /**
   * Generates an anchored create operation.
   */
  public static async generateAnchoredCreateOperation(
    input: AnchoredCreateOperationGenerationInput
  ) {
    const createOperationData = await OperationGenerator.generateCreateOperation();

    const anchoredOperationModel = {
      type: OperationType.Create,
      didUniqueSuffix: createOperationData.createOperation.didUniqueSuffix,
      operationBuffer: createOperationData.createOperation.operationBuffer,
      transactionNumber: input.transactionNumber,
      transactionTime: input.transactionTime,
      operationIndex: input.operationIndex,
    };

    return {
      createOperation: createOperationData.createOperation,
      operationRequest: createOperationData.operationRequest,
      anchoredOperationModel,
      recoveryPublicKey: createOperationData.recoveryPublicKey,
      recoveryPrivateKey: createOperationData.recoveryPrivateKey,
      updatePublicKey: createOperationData.updatePublicKey,
      updatePrivateKey: createOperationData.updatePrivateKey,
      signingPublicKey: createOperationData.signingPublicKey,
      signingPrivateKey: createOperationData.signingPrivateKey,
      nextUpdateRevealValueEncodedString:
        createOperationData.nextUpdateRevealValueEncodedString,
    };
  }

  /**
   * Generates an create operation.
   */
  public static async generateCreateOperation() {
    const signingKeyId = 'signingKey';
    const [
      recoveryPublicKey,
      recoveryPrivateKey,
    ] = await Jwk.generateEd25519KeyPair();
    const [
      updatePublicKey,
      updatePrivateKey,
    ] = await Jwk.generateEd25519KeyPair();
    const [
      signingPublicKey,
      signingPrivateKey,
    ] = await OperationGenerator.generateKeyPair(signingKeyId);
    const service = OperationGenerator.generateServiceEndpoints([
      'serviceEndpointId123',
    ]);

    const operationRequest = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      updatePublicKey,
      [signingPublicKey],
      service
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));

    const createOperation = await CreateOperation.parse(operationBuffer);

    const nextUpdateRevealValueEncodedString = Multihash.canonicalizeThenHashThenEncode(
      signingPublicKey.jwk
    );
    return {
      createOperation,
      operationRequest,
      recoveryPublicKey,
      recoveryPrivateKey,
      updatePublicKey,
      updatePrivateKey,
      signingPublicKey,
      signingPrivateKey,
      nextUpdateRevealValueEncodedString,
    };
  }

  /**
   * Generates a recover operation.
   */
  public static async generateRecoverOperation(
    input: RecoverOperationGenerationInput
  ): Promise<GeneratedRecoverOperationData> {
    const newSigningKeyId = 'newSigningKey';
    const [
      newRecoveryPublicKey,
      newRecoveryPrivateKey,
    ] = await Jwk.generateEd25519KeyPair();
    const [
      newSigningPublicKey,
      newSigningPrivateKey,
    ] = await OperationGenerator.generateKeyPair(newSigningKeyId);
    const [publicKeyToBeInDocument] = await OperationGenerator.generateKeyPair(
      'newKey'
    );
    const services = OperationGenerator.generateServiceEndpoints([
      'serviceEndpointId123',
    ]);

    // Generate the next update and recover operation commitment hash reveal value pair.
    const [
      update_key,
      updatePrivateKey,
    ] = await OperationGenerator.generateKeyPair('update_key');

    const operationJson = await OperationGenerator.generateRecoverOperationRequest(
      input.didUniqueSuffix,
      input.recoveryPrivateKey,
      newRecoveryPublicKey,
      newSigningPublicKey,
      services,
      [publicKeyToBeInDocument]
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationJson));
    const recoverOperation = await RecoverOperation.parse(operationBuffer);

    return {
      recoverOperation,
      operationBuffer,
      recoveryPublicKey: newRecoveryPublicKey,
      recoveryPrivateKey: newRecoveryPrivateKey,
      signingPublicKey: newSigningPublicKey,
      signingPrivateKey: newSigningPrivateKey,
      update_key,
      updatePrivateKey,
    };
  }

  /**
   * Generates an update operation that adds a new key.
   */
  public static async generateUpdateOperation(
    didUniqueSuffix: string,
    updatePublicKey: PublicKeyJwk,
    updatePrivateKey: PrivateKeyJwk
  ) {
    const additionalKeyId = `additional-key`;
    const [
      additionalPublicKey,
      additionalPrivateKey,
    ] = await OperationGenerator.generateKeyPair(additionalKeyId);

    const operationJson = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
      didUniqueSuffix,
      updatePublicKey,
      updatePrivateKey,
      additionalPublicKey,
      Multihash.canonicalizeThenHashThenEncode(additionalPublicKey)
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationJson));
    const updateOperation = await UpdateOperation.parse(operationBuffer);

    return {
      updateOperation,
      operationBuffer,
      additionalKeyId,
      additionalPublicKey,
      additionalPrivateKey,
      nextUpdateKey: additionalPublicKey.jwk,
    };
  }

  /**
   * Creates a named anchored operation model from `OperationModel`.
   */
  public static createAnchoredOperationModelFromOperationModel(
    operationModel: OperationModel,
    transactionTime: number,
    transactionNumber: number,
    operationIndex: number
  ): AnchoredOperationModel {
    const anchoredOperationModel: AnchoredOperationModel = {
      didUniqueSuffix: operationModel.didUniqueSuffix,
      type: operationModel.type,
      operationBuffer: operationModel.operationBuffer,
      operationIndex,
      transactionNumber,
      transactionTime,
    };
    return anchoredOperationModel;
  }

  /**
   * Generates a create operation request.
   */
  public static async generateCreateOperationRequest(
    recoveryPublicKey: PublicKeyJwk,
    updatePublicKey: PublicKeyJwk,
    otherPublicKeys: PublicKeyModel[],
    service_endpoints?: ServiceEndpointModel[]
  ) {
    const document: DocumentModel = {
      public_keys: otherPublicKeys,
      service_endpoints,
    };

    const patches = [
      {
        action: 'replace',
        document,
      },
    ];

    const delta = {
      update_commitment: Multihash.canonicalizeThenHashThenEncode(
        updatePublicKey
      ),
      patches,
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const delta_hash = Encoder.encode(Multihash.hash(deltaBuffer));

    const suffixData = {
      delta_hash: delta_hash,
      recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
        recoveryPublicKey
      ),
    };

    const suffixDataEncodedString = Encoder.encode(JSON.stringify(suffixData));
    const deltaEncodedString = Encoder.encode(deltaBuffer);
    const operation = {
      type: OperationType.Create,
      suffix_data: suffixDataEncodedString,
      delta: deltaEncodedString,
    };

    return operation;
  }

  /**
   * Generates an update operation request.
   */
  public static async generateUpdateOperationRequest(didUniqueSuffix?: string) {
    if (didUniqueSuffix === undefined) {
      didUniqueSuffix = OperationGenerator.generateRandomHash();
    }
    const [nextUpdateKey] = await OperationGenerator.generateKeyPair(
      'nextUpdateKey'
    );
    const nextUpdateCommitmentHash = Multihash.canonicalizeThenHashThenEncode(
      nextUpdateKey.jwk
    );
    const anyNewSigningPublicKeyId = 'anyNewKey';
    const [anyNewSigningKey] = await OperationGenerator.generateKeyPair(
      anyNewSigningPublicKeyId
    );
    const patches = [
      {
        action: 'add-public-keys',
        public_keys: [anyNewSigningKey],
      },
    ];
    const signingKeyId = 'anySigningKeyId';
    const [
      signingPublicKey,
      signingPrivateKey,
    ] = await OperationGenerator.generateKeyPair(signingKeyId);
    const request = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      signingPublicKey.jwk,
      signingPrivateKey,
      nextUpdateCommitmentHash,
      patches
    );

    const buffer = Buffer.from(JSON.stringify(request));
    const updateOperation = await UpdateOperation.parse(buffer);

    return {
      request,
      buffer,
      updateOperation,
    };
  }

  /**
   * Creates an update operation request.
   */
  public static async createUpdateOperationRequest(
    didUniqueSuffix: string,
    updatePublicKey: PublicKeyJwk,
    updatePrivateKey: PrivateKeyJwk,
    nextUpdateCommitmentHash: string,
    patches: any
  ) {
    const delta = {
      patches,
      update_commitment: nextUpdateCommitmentHash,
    };
    const deltaJsonString = JSON.stringify(delta);
    const delta_hash = Encoder.encode(
      Multihash.hash(Buffer.from(deltaJsonString))
    );
    const encodedDeltaString = Encoder.encode(deltaJsonString);

    const signedDataPayloadObject = {
      update_key: updatePublicKey,
      delta_hash: delta_hash,
    };
    const signedData = await OperationGenerator.signUsingEd25519(
      signedDataPayloadObject,
      updatePrivateKey
    );

    const updateOperationRequest = {
      type: OperationType.Update,
      did_suffix: didUniqueSuffix,
      delta: encodedDeltaString,
      signed_data: signedData,
    };

    return updateOperationRequest;
  }

  /**
   * Generates a recover operation request.
   */
  public static async generateRecoverOperationRequest(
    didUniqueSuffix: string,
    recoveryPrivateKey: PrivateKeyJwk,
    newRecoveryPublicKey: PublicKeyJwk,
    newSigningPublicKey: PublicKeyModel,
    service_endpoints?: ServiceEndpointModel[],
    public_keys?: PublicKeyModel[]
  ) {
    const document = {
      public_keys: public_keys,
      service_endpoints: service_endpoints,
    };
    const recoverOperation = await OperationGenerator.createRecoverOperationRequest(
      didUniqueSuffix,
      recoveryPrivateKey,
      newRecoveryPublicKey,
      Multihash.canonicalizeThenHashThenEncode(newSigningPublicKey.jwk),
      document
    );
    return recoverOperation;
  }

  /**
   * Creates a recover operation request.
   */
  public static async createRecoverOperationRequest(
    didUniqueSuffix: string,
    recoveryPrivateKey: PrivateKeyJwk,
    newRecoveryPublicKey: PublicKeyJwk,
    nextUpdateCommitmentHash: string,
    document: any
  ) {
    const patches = [
      {
        action: 'replace',
        document,
      },
    ];

    const delta = {
      patches,
      update_commitment: nextUpdateCommitmentHash,
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const delta_hash = Encoder.encode(Multihash.hash(deltaBuffer));

    const signedDataPayloadObject = {
      delta_hash: delta_hash,
      recovery_key: Jwk.getCurve25519PublicKey(
        recoveryPrivateKey as PrivateKeyJwkEd25519
      ),
      recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
        newRecoveryPublicKey
      ),
    };
    const signedData = await OperationGenerator.signUsingEd25519(
      signedDataPayloadObject,
      recoveryPrivateKey
    );

    const deltaEncodedString = Encoder.encode(deltaBuffer);
    const operation = {
      type: OperationType.Recover,
      did_suffix: didUniqueSuffix,
      signed_data: signedData,
      delta: deltaEncodedString,
    };

    return operation;
  }

  /**
   * Generates a deactivate operation request.
   */
  public static async createDeactivateOperationRequest(
    didUniqueSuffix: string,
    recoveryPrivateKey: PrivateKeyJwk
  ) {
    const signedDataPayloadObject = {
      did_suffix: didUniqueSuffix,
      recovery_key: Jwk.getCurve25519PublicKey(
        recoveryPrivateKey as PrivateKeyJwkEd25519
      ),
    };
    const signedData = await OperationGenerator.signUsingEd25519(
      signedDataPayloadObject,
      recoveryPrivateKey
    );

    const operation = {
      type: OperationType.Deactivate,
      did_suffix: didUniqueSuffix,
      signed_data: signedData,
    };

    return operation;
  }

  /**
   * Generates a create operation request buffer.
   * @param nextRecoveryCommitmentHash The encoded commitment hash for the next recovery.
   * @param nextUpdateCommitmentHash The encoded commitment hash for the next update.
   */
  public static async generateCreateOperationBuffer(
    recoveryPublicKey: PublicKeyJwk,
    signingPublicKey: PublicKeyModel,
    service_endpoints?: ServiceEndpointModel[]
  ): Promise<Buffer> {
    const operation = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      signingPublicKey.jwk,
      [signingPublicKey],
      service_endpoints
    );

    return Buffer.from(JSON.stringify(operation));
  }

  /**
   * Creates an update operation for adding a key.
   */
  public static async createUpdateOperationRequestForAddingAKey(
    didUniqueSuffix: string,
    updatePublicKey: PublicKeyJwk,
    updatePrivateKey: PrivateKeyJwk,
    newPublicKey: PublicKeyModel,
    nextUpdateCommitmentHash: string
  ) {
    const patches = [
      {
        action: 'add-public-keys',
        public_keys: [newPublicKey],
      },
    ];

    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updatePublicKey,
      updatePrivateKey,
      nextUpdateCommitmentHash,
      patches
    );

    return updateOperationRequest;
  }

  /**
   * Creates an update operation for adding and/or removing hub service endpoints.
   */
  public static async createUpdateOperationRequestForHubEndpoints(
    didUniqueSuffix: string,
    updatePublicKey: any,
    updatePrivateKey: PrivateKeyJwk,
    nextUpdateCommitmentHash: string,
    idOfServiceEndpointToAdd: string | undefined,
    idsOfServiceEndpointToRemove: string[]
  ) {
    const patches = [];

    if (idOfServiceEndpointToAdd !== undefined) {
      const patch = {
        action: 'add-service-endpoints',
        service_endpoints: OperationGenerator.generateServiceEndpoints([
          idOfServiceEndpointToAdd,
        ]),
      };

      patches.push(patch);
    }

    if (idsOfServiceEndpointToRemove.length > 0) {
      const patch = {
        action: 'remove-service-endpoints',
        ids: idsOfServiceEndpointToRemove,
      };

      patches.push(patch);
    }

    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updatePublicKey,
      updatePrivateKey,
      nextUpdateCommitmentHash,
      patches
    );

    return updateOperationRequest;
  }

  /**
   * Signs the given payload as a ed25519 compact JWS.
   */
  public static async signUsingEd25519(
    payload: any,
    privateKey: PrivateKeyJwk
  ): Promise<string> {
    const protectedHeader = {
      alg: 'EdDSA',
    };

    const compactJws = await Jws.signAsCompactJws(
      payload,
      privateKey,
      protectedHeader
    );
    return compactJws;
  }

  /**
   * Generates a Deactivate Operation data.
   */
  public static async createDeactivateOperation(
    didUniqueSuffix: string,
    recoveryPrivateKey: PrivateKeyJwk
  ) {
    const operationRequest = await OperationGenerator.createDeactivateOperationRequest(
      didUniqueSuffix,
      recoveryPrivateKey
    );
    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
    const deactivateOperation = await DeactivateOperation.parse(
      operationBuffer
    );

    return {
      operationRequest,
      operationBuffer,
      deactivateOperation,
    };
  }

  /**
   * Generates an array of service endpoints with specified ids
   * @param ids the id field in endpoint.
   */
  public static generateServiceEndpoints(ids: string[]): any[] {
    const service_endpoints = [];
    for (const id of ids) {
      service_endpoints.push({
        id: id,
        type: 'someType',
        endpoint: 'https://www.url.com',
      });
    }
    return service_endpoints;
  }
}
