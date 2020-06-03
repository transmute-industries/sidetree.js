import * as crypto from 'crypto';
import JwkEs256k from '@sidetree/common/src/models/JwkEs256k';
import PublicKeyModel from '@sidetree/common/src/models/PublicKeyModel';
import OperationType from '@sidetree/common/src/enums/OperationType';
import PublicKeyUsage from '@sidetree/common/src/enums/PublicKeyUsage';
import Jwk from '../util/Jwk';
import Jws from '../util/Jws';
import Multihash from '../util/Multihash';
import Encoder from '../util/Encoder';
import CreateOperation from '../CreateOperation';
import UpdateOperation from '../UpdateOperation';
import RecoverOperation from '../RecoverOperation';
import DeactivateOperation from '../DeactivateOperation';
import DocumentComposer from '../DocumentComposer';

export const generateCommitRevealPair: () => [string, string] = () => {
  const revealValueBuffer = crypto.randomBytes(32);
  const revealValueEncodedString = Encoder.encode(revealValueBuffer);
  const commitmentHash = Multihash.hash(revealValueBuffer);
  const commitmentHashEncodedString = Encoder.encode(commitmentHash);
  return [revealValueEncodedString, commitmentHashEncodedString];
};

export const generateCreateOperationRequest = async (
  recoveryPublicKey: JwkEs256k,
  nextUpdateCommitment: string,
  document: any
) => {
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
};

/**
 * Generates SECP256K1 key pair to be used in an operation. If usage not supplied, all usages will be included
 * Mainly used for testing.
 * @returns [publicKey, privateKey]
 */
export const generateKeyPair = async (
  id: string,
  usage?: string[]
): Promise<[PublicKeyModel, JwkEs256k]> => {
  const [publicKey, privateKey] = await Jwk.generateEs256kKeyPair();
  const publicKeyModel = {
    id,
    type: 'EcdsaSecp256k1VerificationKey2019',
    jwk: publicKey,
    usage: usage || Object.values(PublicKeyUsage),
  };

  return [publicKeyModel, privateKey];
};

export interface ICreateOperationData {
  createOperation: CreateOperation;
  operationRequest: {
    type: OperationType;
    suffix_data: string;
    delta: string;
  };
  recoveryPublicKey: any;
  recoveryPrivateKey: any;
  signingKeyId: string;
  signingPublicKey: PublicKeyModel;
  signingPrivateKey: JwkEs256k;
  nextUpdateRevealValueEncodedString: string;
}

export const generateCreateOperation: () => Promise<
  ICreateOperationData
> = async () => {
  const signingKeyId = 'signingKey';
  const [
    recoveryPublicKey,
    recoveryPrivateKey,
  ] = await Jwk.generateEs256kKeyPair();
  const [signingPublicKey, signingPrivateKey] = await generateKeyPair(
    signingKeyId
  );

  // Generate the next update and recover operation commitment hash reveal value pair.
  const [
    nextUpdateRevealValueEncodedString,
    nextUpdateCommitmentHash,
  ] = generateCommitRevealPair();

  const document = {
    publicKeys: [signingPublicKey],
  };
  const operationRequest = await generateCreateOperationRequest(
    recoveryPublicKey,
    nextUpdateCommitmentHash,
    document
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
};

// Update
const signUsingEs256k = async (
  payload: any,
  privateKey: JwkEs256k,
  signingKeyId?: string
): Promise<string> => {
  const protectedHeader = {
    kid: signingKeyId,
    alg: 'ES256K',
  };

  const compactJws = Jws.signAsCompactJws(payload, privateKey, protectedHeader);
  return compactJws;
};

const createUpdateOperationRequest = async (
  didUniqueSuffix: string,
  updateRevealValue: string,
  nextUpdateCommitmentHash: string,
  patches: any,
  signingKeyId: string,
  signingPrivateKey: JwkEs256k
) => {
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
  const signedData = await signUsingEs256k(
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
};

const createUpdateOperationRequestForAddingAKey = async (
  didUniqueSuffix: string,
  updateRevealValue: string,
  newPublicKey: PublicKeyModel,
  nextUpdateCommitmentHash: string,
  signingKeyId: string,
  signingPrivateKey: JwkEs256k
) => {
  const newDoc = {
    publicKeys: [newPublicKey],
  };
  const updatePatch = DocumentComposer.generatePatch({}, newDoc);
  const patches = [updatePatch];

  const updateOperationRequest = await createUpdateOperationRequest(
    didUniqueSuffix,
    updateRevealValue,
    nextUpdateCommitmentHash,
    patches,
    signingKeyId,
    signingPrivateKey
  );

  return updateOperationRequest;
};

/**
 * Generates an update operation that adds a new key.
 */
export const generateUpdateOperation = async (
  didUniqueSuffix: string,
  updateRevealValue: string,
  updatePrivateKeyId: string,
  updatePrivateKey: JwkEs256k
) => {
  const additionalKeyId = `additional-key`;
  const [additionalPublicKey, additionalPrivateKey] = await generateKeyPair(
    additionalKeyId
  );
  const [
    nextUpdateRevealValue,
    nextUpdateCommitValue,
  ] = generateCommitRevealPair();

  const operationJson = await createUpdateOperationRequestForAddingAKey(
    didUniqueSuffix,
    updateRevealValue,
    additionalPublicKey,
    nextUpdateCommitValue,
    updatePrivateKeyId,
    updatePrivateKey
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
};

// Recovery
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

const createRecoverOperationRequest = async (
  didUniqueSuffix: string,
  recoveryPrivateKey: JwkEs256k,
  newRecoveryPublicKey: JwkEs256k,
  nextUpdateCommitmentHash: string,
  document: any
) => {
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
  const signedData = await signUsingEs256k(
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
};

const generateRecoverOperationRequest = async (
  didUniqueSuffix: string,
  recoveryPrivateKey: JwkEs256k,
  newRecoveryPublicKey: JwkEs256k,
  newSigningPublicKey: PublicKeyModel,
  nextUpdateCommitmentHash: string
) => {
  const document = {
    publicKeys: [newSigningPublicKey],
  };
  const recoverOperation = await createRecoverOperationRequest(
    didUniqueSuffix,
    recoveryPrivateKey,
    newRecoveryPublicKey,
    nextUpdateCommitmentHash,
    document
  );
  return recoverOperation;
};

export const generateRecoverOperation = async (
  input: RecoverOperationGenerationInput
): Promise<GeneratedRecoverOperationData> => {
  const newSigningKeyId = 'newSigningKey';
  const [
    newRecoveryPublicKey,
    newRecoveryPrivateKey,
  ] = await Jwk.generateEs256kKeyPair();
  const [newSigningPublicKey, newSigningPrivateKey] = await generateKeyPair(
    newSigningKeyId
  );

  // Generate the next update and recover operation commitment hash reveal value pair.
  const [
    nextUpdateRevealValueEncodedString,
    nextUpdateCommitmentHash,
  ] = generateCommitRevealPair();

  const operationJson = await generateRecoverOperationRequest(
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
};

// Deactivate
const createDeactivateOperationRequest = async (
  didUniqueSuffix: string,
  recoveryPrivateKey: JwkEs256k
) => {
  const signedDataPayloadObject = {
    did_suffix: didUniqueSuffix,
    recovery_key: Jwk.getEs256kPublicKey(recoveryPrivateKey),
  };
  const signedData = await signUsingEs256k(
    signedDataPayloadObject,
    recoveryPrivateKey
  );

  const operation = {
    type: OperationType.Deactivate,
    did_suffix: didUniqueSuffix,
    signed_data: signedData,
  };

  return operation;
};

export const createDeactivateOperation = async (
  didUniqueSuffix: string,
  recoveryPrivateKey: JwkEs256k
) => {
  const operationRequest = await createDeactivateOperationRequest(
    didUniqueSuffix,
    recoveryPrivateKey
  );
  const operationBuffer = Buffer.from(JSON.stringify(operationRequest));
  const deactivateOperation = await DeactivateOperation.parse(operationBuffer);

  return {
    operationRequest,
    operationBuffer,
    deactivateOperation,
  };
};
