import * as bip39 from 'bip39';
import Jwk from './util/Jwk';
import {
  PublicKeyJwk,
  PrivateKeyJwk,
  Multihash,
  Encoder,
  OperationType,
} from '@sidetree/common';
import CreateOperation from './CreateOperation';
import jsonpatch from 'fast-json-patch';

class SidetreeKeys {
  public static async generateMnemonic() {
    const mnemonic = await bip39.generateMnemonic();
    return mnemonic;
  }

  public static async generateKeyPairFromMnemonic(
    mnemonic: string,
    index: number
  ): Promise<[PublicKeyJwk, PrivateKeyJwk]> {
    const [
      publicKeyJwk,
      privateKeyJwk,
    ] = await Jwk.generateJwkKeyPairFromMnemonic('ed25519', mnemonic, index);
    return [publicKeyJwk, privateKeyJwk];
  }
}

class SidetreeOperations {
  public static async generateCreateOperation(
    signingKeyPair: [PublicKeyJwk, PrivateKeyJwk],
    updateKeyPair: [PublicKeyJwk, PrivateKeyJwk],
    recoverKeyPair: [PublicKeyJwk, PrivateKeyJwk],
    documentModel: unknown
  ) {
    const patches = [
      {
        action: 'ietf-json-patch',
        patches: jsonpatch.compare({}, documentModel),
      },
    ];

    const delta = {
      update_commitment: Multihash.canonicalizeThenHashThenEncode(
        updateKeyPair[0]
      ),
      patches,
    };
    const deltaBuffer = Buffer.from(JSON.stringify(delta));
    const delta_hash = Encoder.encode(Multihash.hash(deltaBuffer));

    const suffixData = {
      delta_hash: delta_hash,
      recovery_commitment: Multihash.canonicalizeThenHashThenEncode(
        recoverKeyPair[0]
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
      signingKeyPair[0]
    );
    return {
      createOperation,
      operationRequest,
      nextUpdateRevealValueEncodedString,
    };
  }
}

const keys = new SidetreeKeys();
const operations = new SidetreeOperations();

export default {
  keys,
  operations,
};
