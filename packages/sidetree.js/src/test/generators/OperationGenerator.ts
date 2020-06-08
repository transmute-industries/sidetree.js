import OperationType from '@sidetree/common/src/enums/OperationType';
import PublicKeyUsage from '@sidetree/common/src/enums/PublicKeyUsage';
import AnchoredOperationModel from '@sidetree/common/src/models/AnchoredOperationModel';
import JwkEs256k from '@sidetree/common/src/models/JwkEs256k';
import OperationModel from '@sidetree/common/src/models/OperationModel';
import PublicKeyModel from '@sidetree/common/src/models/PublicKeyModel';
import ServiceEndpointModel from '@sidetree/common/src/models/ServiceEndpointModel';
import * as crypto from 'crypto';
import CreateOperation from '../../CreateOperation';
import DeactivateOperation from '../../DeactivateOperation';
import DocumentComposer from '../../DocumentComposer';
import RecoverOperation from '../../RecoverOperation';
import UpdateOperation from '../../UpdateOperation';
import Encoder from '../../util/Encoder';
import Jwk from '../../util/Jwk';
import Jws from '../../util/Jws';
import Multihash from '../../util/Multihash';

interface AnchoredCreateOperationGenerationInput {
  transactionNumber: number;
  transactionTime: number;
  operationIndex: number;
}

interface RecoverOperationGenerationInput {
  didUniqueSuffix: string;
  recoveryPrivateKey: JwkEs256k;
}

interface GeneratedRecoverOperationData {
  operationBuffer: Buffer;
  recoverOperation: RecoverOperation;
  recoveryPublicKey: JwkEs256k;
  recoveryPrivateKey: JwkEs256k;
  signingKeyId: string;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: JwkEs256k;
  nextUpdateRevealValueEncodedString: string;
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
   * Generates a reveal value and commitment hash as encoded strings for use in operations.
   * @returns [revealValueEncodedString, commitmentValueHashEncodedString]
   */
  public static generateCommitRevealPair(): [string, string] {
    const revealValueBuffer = crypto.randomBytes(32);
    const revealValueEncodedString = Encoder.encode(revealValueBuffer);
    const commitmentHash = Multihash.hash(revealValueBuffer, 18); // 18 = SHA256;
    const commitmentHashEncodedString = Encoder.encode(commitmentHash);

    return [revealValueEncodedString, commitmentHashEncodedString];
  }

  /**
   * Generates SECP256K1 key pair to be used in an operation. If usage not supplied, all usages will be included
   * Mainly used for testing.
   * @returns [publicKey, privateKey]
   */
  public static async generateKeyPair(
    id: string,
    usage?: string[]
  ): Promise<[PublicKeyModel, JwkEs256k]> {
    const [publicKey, privateKey] = await Jwk.generateEs256kKeyPair();
    const publicKeyModel = {
      id,
      type: 'EcdsaSecp256k1VerificationKey2019',
      jwk: publicKey,
      usage: usage || Object.values(PublicKeyUsage),
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
      signingKeyId: createOperationData.signingKeyId,
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
    ] = await Jwk.generateEs256kKeyPair();
    const [
      signingPublicKey,
      signingPrivateKey,
    ] = await OperationGenerator.generateKeyPair(signingKeyId);

    // Generate the next update and recover operation commitment hash reveal value pair.
    const [
      nextUpdateRevealValueEncodedString,
      nextUpdateCommitmentHash,
    ] = OperationGenerator.generateCommitRevealPair();

    const doc = {
      publicKeys: [signingPublicKey],
    };
    const operationRequest = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      doc
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationRequest));

    const createOperation = await CreateOperation.parse(operationBuffer);

    return {
      createOperation,
      operationRequest,
      recoveryPublicKey,
      recoveryPrivateKey,
      signingKeyId,
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
    ] = await Jwk.generateEs256kKeyPair();
    const [
      newSigningPublicKey,
      newSigningPrivateKey,
    ] = await OperationGenerator.generateKeyPair(newSigningKeyId);

    // Generate the next update and recover operation commitment hash reveal value pair.
    const [
      nextUpdateRevealValueEncodedString,
      nextUpdateCommitmentHash,
    ] = OperationGenerator.generateCommitRevealPair();

    const operationJson = await OperationGenerator.generateRecoverOperationRequest(
      input.didUniqueSuffix,
      input.recoveryPrivateKey,
      newRecoveryPublicKey,
      newSigningPublicKey,
      nextUpdateCommitmentHash
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationJson));
    const recoverOperation = await RecoverOperation.parse(operationBuffer);

    return {
      recoverOperation,
      operationBuffer,
      recoveryPublicKey: newRecoveryPublicKey,
      recoveryPrivateKey: newRecoveryPrivateKey,
      signingKeyId: newSigningKeyId,
      signingPublicKey: newSigningPublicKey,
      signingPrivateKey: newSigningPrivateKey,
      nextUpdateRevealValueEncodedString,
    };
  }

  /**
   * Generates an update operation that adds a new key.
   */
  public static async generateUpdateOperation(
    didUniqueSuffix: string,
    updateRevealValue: string,
    updatePrivateKeyId: string,
    updatePrivateKey: JwkEs256k
  ) {
    const additionalKeyId = `additional-key`;
    const [
      additionalPublicKey,
      additionalPrivateKey,
    ] = await OperationGenerator.generateKeyPair(additionalKeyId);
    const [
      nextUpdateRevealValue,
      nextUpdateCommitValue,
    ] = OperationGenerator.generateCommitRevealPair();

    const operationJson = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
      didUniqueSuffix,
      updateRevealValue,
      additionalPublicKey,
      nextUpdateCommitValue,
      updatePrivateKeyId,
      updatePrivateKey,
      // FIXME
      {}
    );

    const operationBuffer = Buffer.from(JSON.stringify(operationJson));
    const updateOperation = await UpdateOperation.parse(operationBuffer);

    return {
      updateOperation,
      operationBuffer,
      additionalKeyId,
      additionalPublicKey,
      additionalPrivateKey,
      nextUpdateRevealValue,
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
   * @param nextRecoveryCommitment The encoded commitment hash for the next recovery.
   * @param nextUpdateCommitment The encoded commitment hash for the next update.
   */
  public static async generateCreateOperationRequest(
    recoveryPublicKey: JwkEs256k,
    nextUpdateCommitment: string,
    document: any
  ) {
    const createPatch = DocumentComposer.generatePatch({}, document);
    const patches = [createPatch];
    const delta = {
      update_commitment: nextUpdateCommitment,
      patches,
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));

    const suffixData = {
      delta_hash: deltaHash,
      recovery_commitment: await Multihash.canonicalizeThenHashThenEncode(
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
   * Creates an update operation request.
   */
  public static async createUpdateOperationRequest(
    didUniqueSuffix: string,
    updateRevealValue: string,
    nextUpdateCommitmentHash: string,
    patches: any,
    signingKeyId: string,
    signingPrivateKey: JwkEs256k
  ) {
    const delta = {
      patches,
      update_commitment: nextUpdateCommitmentHash,
    };
    const deltaJsonString = JSON.stringify(delta);
    const deltaHash = Encoder.encode(
      Multihash.hash(Buffer.from(deltaJsonString))
    );
    const encodedDeltaString = Encoder.encode(deltaJsonString);

    const signedDataPayloadObject = {
      update_reveal_value: updateRevealValue,
      delta_hash: deltaHash,
    };
    const signedData = await OperationGenerator.signUsingEs256k(
      signedDataPayloadObject,
      signingPrivateKey,
      signingKeyId
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
    recoveryPrivateKey: JwkEs256k,
    newRecoveryPublicKey: JwkEs256k,
    newSigningPublicKey: PublicKeyModel,
    nextUpdateCommitmentHash: string,
    serviceEndpoints?: ServiceEndpointModel[]
  ) {
    const document = {
      publicKeys: [newSigningPublicKey],
      service: serviceEndpoints,
    };
    const recoverOperation = await OperationGenerator.createRecoverOperationRequest(
      didUniqueSuffix,
      recoveryPrivateKey,
      newRecoveryPublicKey,
      nextUpdateCommitmentHash,
      document
    );
    return recoverOperation;
  }

  /**
   * Creates a recover operation request.
   */
  public static async createRecoverOperationRequest(
    didUniqueSuffix: string,
    recoveryPrivateKey: JwkEs256k,
    newRecoveryPublicKey: JwkEs256k,
    nextUpdateCommitmentHash: string,
    document: any
  ) {
    const recoverPatch = DocumentComposer.generatePatch({}, document);
    const patches = [recoverPatch];

    const delta = {
      patches,
      update_commitment: nextUpdateCommitmentHash,
    };

    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const deltaHash = Encoder.encode(Multihash.hash(deltaBuffer));

    const signedDataPayloadObject = {
      delta_hash: deltaHash,
      recovery_key: Jwk.getEs256kPublicKey(recoveryPrivateKey),
      recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
        newRecoveryPublicKey
      ),
    };
    const signedData = await OperationGenerator.signUsingEs256k(
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
   * Creates an update operation for adding and/or removing hub service endpoints.
   */
  public static async createUpdateOperationRequestForHubEndpoints(
    didUniqueSuffix: string,
    updateRevealValue: string,
    nextUpdateCommitmentHash: string,
    idOfServiceEndpointToAdd: string | undefined,
    idsOfServiceEndpointToRemove: string[],
    signingKeyId: string,
    signingPrivateKey: JwkEs256k,
    oldDocument: any
  ) {
    let servicesToAdd: Array<Object>;
    if (idOfServiceEndpointToAdd) {
      servicesToAdd = OperationGenerator.generateServiceEndpoints([
        idOfServiceEndpointToAdd,
      ]);
    } else {
      servicesToAdd = [];
    }
    const documentWithAddedServiceEndpoints = {
      ...oldDocument,
      service: [...(oldDocument.service || []), ...servicesToAdd],
    };

    if (idOfServiceEndpointToAdd) {
      servicesToAdd = OperationGenerator.generateServiceEndpoints([
        idOfServiceEndpointToAdd,
      ]);
    } else {
      servicesToAdd = [];
    }
    const documentWithAddedServices = {
      ...oldDocument,
      service: [...(oldDocument.service || []), ...servicesToAdd],
    };
    // TODO: test me
    const idsToRemove = new Set(idsOfServiceEndpointToRemove);
    const documentWithAddedAndRemovedServices = {
      ...documentWithAddedServices,
      service: (documentWithAddedServiceEndpoints.service || []).filter(
        (s: any) => !idsToRemove.has(s.id)
      ),
    };
    const updatePatch = DocumentComposer.generatePatch(
      oldDocument,
      documentWithAddedAndRemovedServices
    );

    const patches = [updatePatch];

    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updateRevealValue,
      nextUpdateCommitmentHash,
      patches,
      signingKeyId,
      signingPrivateKey
    );

    return updateOperationRequest;
  }

  /**
   * Generates a deactivate operation request.
   */
  public static async createDeactivateOperationRequest(
    didUniqueSuffix: string,
    recoveryPrivateKey: JwkEs256k
  ) {
    const signedDataPayloadObject = {
      did_suffix: didUniqueSuffix,
      recovery_key: Jwk.getEs256kPublicKey(recoveryPrivateKey),
    };
    const signedData = await OperationGenerator.signUsingEs256k(
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
    recoveryPublicKey: JwkEs256k,
    signingPublicKey: PublicKeyModel,
    nextUpdateCommitmentHash: string
  ): Promise<Buffer> {
    const doc = {
      publicKeys: [signingPublicKey],
    };
    const operation = await OperationGenerator.generateCreateOperationRequest(
      recoveryPublicKey,
      nextUpdateCommitmentHash,
      doc
    );

    return Buffer.from(JSON.stringify(operation));
  }

  /**
   * Creates an update operation for adding a key.
   */
  public static async createUpdateOperationRequestForAddingAKey(
    didUniqueSuffix: string,
    updateRevealValue: string,
    newPublicKey: PublicKeyModel,
    nextUpdateCommitmentHash: string,
    signingKeyId: string,
    signingPrivateKey: JwkEs256k,
    oldDocument: any
  ) {
    const newDocument = {
      ...oldDocument,
      publicKeys: [...(oldDocument.publicKeys || []), newPublicKey],
    };
    const updatePatch = DocumentComposer.generatePatch(
      oldDocument,
      newDocument
    );
    const patches = [updatePatch];

    const updateOperationRequest = await OperationGenerator.createUpdateOperationRequest(
      didUniqueSuffix,
      updateRevealValue,
      nextUpdateCommitmentHash,
      patches,
      signingKeyId,
      signingPrivateKey
    );

    return updateOperationRequest;
  }

  /**
   * Signs the given payload as a ES256K compact JWS.
   */
  public static async signUsingEs256k(
    payload: any,
    privateKey: JwkEs256k,
    signingKeyId?: string
  ): Promise<string> {
    const protectedHeader = {
      kid: signingKeyId,
      alg: 'ES256K',
    };

    const compactJws = Jws.signAsCompactJws(
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
    recoveryPrivateKey: JwkEs256k
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
    const serviceEndpoints = [];
    for (const id of ids) {
      serviceEndpoints.push({
        id: id,
        type: 'someType',
        endpoint: 'https://www.url.com',
      });
    }
    return serviceEndpoints;
  }
}
