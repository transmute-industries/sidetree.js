import {
  JwkEs256k,
  Multihash,
  Encoder,
  PublicKeyModel,
  ServiceEndpointModel,
  OperationType,
} from '@sidetree/common';
import CreateOperation from '../../CreateOperation';
import Jwk from '../../util/Jwk';
import OperationGenerator from './OperationGenerator';
import jsonpatch from 'fast-json-patch';

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
}
