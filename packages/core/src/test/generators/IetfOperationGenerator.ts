import {
  JwkEs256k,
  Multihash,
  Encoder,
  PublicKeyModel,
  ServiceEndpointModel,
  OperationType,
} from '@sidetree/common';
import CreateOperation from '../../CreateOperation';
import UpdateOperation from '../../UpdateOperation';
import RecoverOperation from '../../RecoverOperation';
import Jwk from '../../util/Jwk';
import OperationGenerator from './OperationGenerator';
import jsonpatch from 'fast-json-patch';

interface RecoverOperationGenerationInput {
  didUniqueSuffix: string;
  recoveryPrivateKey: JwkEs256k;
}

interface GeneratedRecoverOperationData {
  operationBuffer: Buffer;
  recoverOperation: RecoverOperation;
  recoveryPublicKey: JwkEs256k;
  recoveryPrivateKey: JwkEs256k;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: JwkEs256k;
  updateKey: PublicKeyModel;
  updatePrivateKey: JwkEs256k;
}

export default class IetfOperationGenerator {
  /**
   * Generates a create operation request.
   */
  public static async generateCreateOperationRequest(
    recoveryPublicKey: JwkEs256k,
    updatePublicKey: JwkEs256k,
    otherPublicKeys: PublicKeyModel[],
    serviceEndpoints?: ServiceEndpointModel[]
  ) {
    const document = {
      publicKey: otherPublicKeys,
      service: serviceEndpoints,
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
    const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));

    const suffixData = {
      delta_hash: deltaHash,
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
   * Generates an create operation.
   */
  public static async generateCreateOperation() {
    const signingKeyId = 'signingKey';
    const [
      recoveryPublicKey,
      recoveryPrivateKey,
    ] = await Jwk.generateEs256kKeyPair();
    const [
      updatePublicKey,
      updatePrivateKey,
    ] = await Jwk.generateEs256kKeyPair();
    const [
      signingPublicKey,
      signingPrivateKey,
    ] = await OperationGenerator.generateKeyPair(signingKeyId);
    const service = OperationGenerator.generateServiceEndpoints([
      'serviceEndpointId123',
    ]);

    const operationRequest = await IetfOperationGenerator.generateCreateOperationRequest(
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
   * Generates an update operation that adds a new key.
   */
  public static async generateUpdateOperation(
    didUniqueSuffix: string,
    updatePublicKey: JwkEs256k,
    updatePrivateKey: JwkEs256k
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
    ] = await Jwk.generateEs256kKeyPair();
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
      updateKey,
      updatePrivateKey,
    ] = await OperationGenerator.generateKeyPair('updateKey');

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
    const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));

    const signedDataPayloadObject = {
      delta_hash: deltaHash,
      recovery_key: Jwk.getEs256kPublicKey(input.recoveryPrivateKey),
      // TODO: TEST THAT THIS DOESNT WORK
      // recovery_key: Jwk.getEs256kPublicKey(newRecoveryPrivateKey),
      recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
        newRecoveryPublicKey
      ),
    };
    const signedData = await OperationGenerator.signUsingEs256k(
      signedDataPayloadObject,
      input.recoveryPrivateKey
    );

    const deltaEncodedString = Encoder.encode(deltaBuffer);
    const operation = {
      type: OperationType.Recover,
      did_suffix: input.didUniqueSuffix,
      signed_data: signedData,
      delta: deltaEncodedString,
    };

    // const recoverOperation = await OperationGenerator.createRecoverOperationRequest(
    //   didUniqueSuffix,
    //   recoveryPrivateKey,
    //   newRecoveryPublicKey,
    //   Multihash.canonicalizeThenHashThenEncode(newSigningPublicKey.jwk),
    //   document
    // );
    // return recoverOperation;

    // const operationJson = await OperationGenerator.generateRecoverOperationRequest(
    //   input.didUniqueSuffix,
    //   input.recoveryPrivateKey,
    //   newRecoveryPublicKey,
    //   newSigningPublicKey,
    //   services,
    //   [publicKeyToBeInDocument]
    // );

    const operationBuffer = Buffer.from(JSON.stringify(operation));
    const recoverOperation = await RecoverOperation.parse(operationBuffer);

    return {
      recoverOperation,
      operationBuffer,
      recoveryPublicKey: newRecoveryPublicKey,
      recoveryPrivateKey: newRecoveryPrivateKey,
      signingPublicKey: newSigningPublicKey,
      signingPrivateKey: newSigningPrivateKey,
      updateKey,
      updatePrivateKey,
    };
  }

  // public static async generateRecoverOperation() {
  //   const signingKeyId = 'signingKey';
  //   const [
  //     recoveryPublicKey,
  //     recoveryPrivateKey,
  //   ] = await Jwk.generateEs256kKeyPair();
  //   const [
  //     updatePublicKey,
  //     updatePrivateKey,
  //   ] = await Jwk.generateEs256kKeyPair();
  //   const [
  //     signingPublicKey,
  //     signingPrivateKey,
  //   ] = await OperationGenerator.generateKeyPair(signingKeyId);
  //   const service = OperationGenerator.generateServiceEndpoints([
  //     'serviceEndpointId123',
  //   ]);

  //   const document = {
  //     publicKey: [signingPublicKey],
  //     service,
  //   };
  //   const patches = [
  //     {
  //       action: 'ietf-json-patch',
  //       patches: jsonpatch.compare({}, document),
  //     },
  //   ];

  //   const delta = {
  //     patches,
  //     update_commitment: Multihash.canonicalizeThenHashThenEncode(
  //       updatePublicKey
  //     ),
  //   };

  //   const deltaBuffer = Buffer.from(JSON.stringify(delta));
  //   const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));

  //   const signedDataPayloadObject = {
  //     delta_hash: deltaHash,
  //     recovery_key: Jwk.getEs256kPublicKey(recoveryPrivateKey),
  //     recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
  //       recoveryPublicKey
  //     ),
  //   };
  //   const signedData = await OperationGenerator.signUsingEs256k(
  //     signedDataPayloadObject,
  //     recoveryPrivateKey
  //   );

  //   const deltaEncodedString = Encoder.encode(deltaBuffer);
  //   const operation = {
  //     type: OperationType.Recover,
  //     did_suffix: didUniqueSuffix,
  //     signed_data: signedData,
  //     delta: deltaEncodedString,
  //   };

  //   const operationBuffer = Buffer.from(JSON.stringify(operationRequest));

  //   const createOperation = await CreateOperation.parse(operationBuffer);

  //   const nextUpdateRevealValueEncodedString = Multihash.canonicalizeThenHashThenEncode(
  //     signingPublicKey.jwk
  //   );
  //   return {
  //     createOperation,
  //     operationRequest,
  //     recoveryPublicKey,
  //     recoveryPrivateKey,
  //     updatePublicKey,
  //     updatePrivateKey,
  //     signingPublicKey,
  //     signingPrivateKey,
  //     nextUpdateRevealValueEncodedString,
  //   };
  // }
}
