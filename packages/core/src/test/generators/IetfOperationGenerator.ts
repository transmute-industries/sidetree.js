import {
  JwkCurve25519,
  Multihash,
  Encoder,
  PublicKeyModel,
  OperationType,
} from '@sidetree/common';
import CreateOperation from '../../CreateOperation';
import UpdateOperation from '../../UpdateOperation';
import RecoverOperation from '../../RecoverOperation';
import DeactivateOperation from '../../DeactivateOperation';
import Jwk from '../../util/Jwk';
import OperationGenerator from './OperationGenerator';
import jsonpatch from 'fast-json-patch';

interface GeneratedRecoverOperationData {
  operationBuffer: Buffer;
  recoverOperation: RecoverOperation;
  recoveryPublicKey: JwkCurve25519;
  recoveryPrivateKey: JwkCurve25519;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: JwkCurve25519;
  update_key: PublicKeyModel;
  updatePrivateKey: JwkCurve25519;
}

export default class IetfOperationGenerator {
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

    const document = {
      publicKey: [signingPublicKey],
      service,
    };

    const patches = [
      {
        action: 'ietf-json-patch',
        patches: jsonpatch.compare({}, document),
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
    const operationRequest = {
      type: OperationType.Create,
      suffix_data: suffixDataEncodedString,
      delta: deltaEncodedString,
    };

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
   * Generates an update operation that adds a new key.
   */
  public static async generateUpdateOperation(
    didUniqueSuffix: string,
    updatePublicKey: JwkCurve25519,
    updatePrivateKey: JwkCurve25519
  ) {
    const additionalKeyId = `additional-key`;
    const [
      additionalPublicKey,
      additionalPrivateKey,
    ] = await OperationGenerator.generateKeyPair(additionalKeyId);

    const nextUpdateCommitmentHash = Multihash.canonicalizeThenHashThenEncode(
      additionalPublicKey
    );

    const patches = [
      {
        action: 'ietf-json-patch',
        patches: [
          {
            op: 'add',
            path: '/publicKey/999',
            value: additionalPublicKey,
          },
        ],
      },
    ];

    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updatePublicKey,
      updatePrivateKey,
      nextUpdateCommitmentHash,
      patches
    );

    const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
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

  public static async generateBadUpdateOperation(
    didUniqueSuffix: string,
    updatePublicKey: JwkCurve25519,
    updatePrivateKey: JwkCurve25519,
    oldDocument: any
  ) {
    const additionalKeyId = 'next-update-key';
    const [
      additionalPublicKey,
      additionalPrivateKey,
    ] = await OperationGenerator.generateKeyPair(additionalKeyId);

    const nextUpdateCommitmentHash = Multihash.canonicalizeThenHashThenEncode(
      additionalPublicKey
    );

    const newDocument = {
      publicKey: [],
    };

    const patches = [
      {
        action: 'ietf-json-patch',
        patches: jsonpatch.compare(oldDocument, newDocument),
      },
    ];
    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updatePublicKey,
      updatePrivateKey,
      nextUpdateCommitmentHash,
      patches
    );

    const operationBuffer = Buffer.from(JSON.stringify(updateOperationRequest));
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
   * Generates a recover operation.
   */
  public static async generateRecoverOperation(
    didUniqueSuffix: string,
    recoveryPrivateKey: JwkCurve25519
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

    const document = {
      publicKey: [publicKeyToBeInDocument],
      service: services,
    };

    const patches = [
      {
        action: 'ietf-json-patch',
        patches: jsonpatch.compare({}, document),
      },
    ];

    const delta = {
      patches,
      update_commitment: Multihash.canonicalizeThenHashThenEncode(
        newSigningPublicKey.jwk
      ),
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const delta_hash = Encoder.encode(Multihash.hash(deltaBuffer));

    const signedDataPayloadObject = {
      delta_hash: delta_hash,
      recovery_key: Jwk.getCurve25519PublicKey(recoveryPrivateKey),
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

    const operationBuffer = Buffer.from(JSON.stringify(operation));
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
   * Generates a Deactivate Operation data.
   */
  public static async createDeactivateOperation(
    didUniqueSuffix: string,
    recoveryPrivateKey: JwkCurve25519
  ) {
    const signedDataPayloadObject = {
      did_suffix: didUniqueSuffix,
      recovery_key: Jwk.getCurve25519PublicKey(recoveryPrivateKey),
    };
    const signedData = await OperationGenerator.signUsingEd25519(
      signedDataPayloadObject,
      recoveryPrivateKey
    );

    const operationRequest = {
      type: OperationType.Deactivate,
      did_suffix: didUniqueSuffix,
      signed_data: signedData,
    };

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
}
