import * as crypto from 'crypto';
import JwkEs256k from './models/JwkEs256k';
import PublicKeyModel from './models/PublicKeyModel';
import OperationType from './enums/OperationType';
import PublicKeyUsage from './enums/PublicKeyUsage';
import Jwk from './util/Jwk';
import Multihash from './util/Multihash';
import Encoder from './util/Encoder';
import CreateOperation from './CreateOperation';

export const generateCommitRevealPair = () => {
  const revealValueBuffer = crypto.randomBytes(32);
  const revealValueEncodedString = Encoder.encode(revealValueBuffer);
  const commitmentHash = Multihash.hash(revealValueBuffer);
  const commitmentHashEncodedString = Encoder.encode(commitmentHash);
  return [revealValueEncodedString, commitmentHashEncodedString];
}

const generateCreateOperationRequest = async (
  recoveryPublicKey: JwkEs256k,
  signingPublicKey: PublicKeyModel,
  nextUpdateCommitment: string
) => {
  const document = {
    publicKeys: [signingPublicKey],
  };

  const patches = [
    {
      action: 'replace',
      document,
    },
  ];

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
const generateKeyPair = async (id: string, usage?: string[]): Promise<[PublicKeyModel, JwkEs256k]> => {
    const [publicKey, privateKey] = await Jwk.generateEs256kKeyPair();
    const publicKeyModel = {
      id,
      type: 'EcdsaSecp256k1VerificationKey2019',
      jwk: publicKey,
      usage: usage || Object.values(PublicKeyUsage)
    };

    return [publicKeyModel, privateKey];
  }

export const generateCreateOperation = async () => {
  const signingKeyId = 'signingKey';
  const [recoveryPublicKey, recoveryPrivateKey] = await Jwk.generateEs256kKeyPair();
  const [signingPublicKey, signingPrivateKey] = await generateKeyPair(signingKeyId);

  // Generate the next update and recover operation commitment hash reveal value pair.
  const [nextUpdateRevealValueEncodedString, nextUpdateCommitmentHash] = generateCommitRevealPair();

  const operationRequest = await generateCreateOperationRequest(
    recoveryPublicKey,
    signingPublicKey,
    nextUpdateCommitmentHash
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
    nextUpdateRevealValueEncodedString
  };
}
