import vectors from '@sidetree/test-vectors';
import { SidetreeWalletPlugin } from '@sidetree/wallet';
const wallet = SidetreeWalletPlugin.build();

const methodName = 'example';
const methodNetwork = 'sidetree.testnet';

const fixture: any = {};

const removeExtraneousProperties = (key: any) => {
  const { id, type, controller, publicKeyJwk, privateKeyJwk } = key;
  return { id, type, controller, publicKeyJwk, privateKeyJwk };
};

const keyType = 'secp256k1';

describe('wallet', () => {
  it('create operation and long form did', async () => {
    const { mnemonic, op0 } = vectors.wallet.operations[0];
    const { delta } = op0;

    const key1 = await wallet.toKeyPair(mnemonic, 1, keyType);
    const key2 = await wallet.toKeyPair(mnemonic, 2, keyType);
    const longFormDid = await wallet.createLongFormDid({
      method: methodName,
      network: methodNetwork,
      document: delta.patches[0].document as any,
      updateKey: key2.publicKeyJwk,
      recoveryKey: key1.publicKeyJwk,
    });
    fixture['create'] = {
      longFormDid,
      operation: op0,
      updateKey: removeExtraneousProperties(key2),
      recoveryKey: removeExtraneousProperties(key1),
    };
    const { resolve, ...expected } = vectors.didMethod.operations['create'];
    expect(resolve).toBeDefined();
    expect(fixture['create']).toEqual(expected);
  });
  it('update operation and resolve updated document', async () => {
    const { mnemonic, op1 } = vectors.wallet.operations[0];
    const key1 = await wallet.toKeyPair(mnemonic, 1, keyType);
    const key4 = await wallet.toKeyPair(mnemonic, 4, keyType);
    fixture['update'] = {
      operation: op1,
      updateKey: removeExtraneousProperties(key4),
      recoveryKey: removeExtraneousProperties(key1),
    };
    const { resolve, ...expected } = vectors.didMethod.operations['update'];
    expect(resolve).toBeDefined();
    expect(fixture['update']).toEqual(expected);
  });
  it('recover operation and resolve recovered document', async () => {
    const { mnemonic, op2 } = vectors.wallet.operations[0];
    const key5 = await wallet.toKeyPair(mnemonic, 5, keyType);
    const key6 = await wallet.toKeyPair(mnemonic, 6, keyType);
    fixture['recover'] = {
      operation: op2,
      updateKey: removeExtraneousProperties(key6),
      recoveryKey: removeExtraneousProperties(key5),
    };
    const { resolve, ...expected } = vectors.didMethod.operations['recover'];
    expect(resolve).toBeDefined();
    expect(fixture['recover']).toEqual(expected);
  });
  it('deactivate operation and resolve deactivated document', async () => {
    const { op3 } = vectors.wallet.operations[0];
    fixture['deactivate'] = {
      operation: op3,
    };
    const { resolve, ...expected } = vectors.didMethod.operations['deactivate'];
    expect(resolve).toBeDefined();
    expect(fixture['deactivate']).toEqual(expected);
  });
});
