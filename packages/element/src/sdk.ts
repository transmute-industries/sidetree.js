import * as bip39 from 'bip39';
import {
  PublicKeyJwk,
  PrivateKeyJwk,
  Multihash,
  Encoder,
  OperationType,
} from '@sidetree/common';
import { CreateOperation, Jwk } from '@sidetree/core';
import jsonpatch from 'fast-json-patch';

class Keys {
  public static async generateMnemonic(): Promise<string> {
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

class Operations {
  public static async generateCreateOperation(
    _: [PublicKeyJwk, PrivateKeyJwk],
    updateKeyPair: [PublicKeyJwk, PrivateKeyJwk],
    recoverKeyPair: [PublicKeyJwk, PrivateKeyJwk],
    documentModel: Record<string, unknown>
  ): Promise<CreateOperation> {
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

    return createOperation;
  }
}

export default {
  Keys,
  Operations,
};
