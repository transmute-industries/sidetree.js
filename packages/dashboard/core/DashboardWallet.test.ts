import { dashboardWalletFactory } from './DashboardWallet';

describe('Dashboard Wallet', () => {
  it('creates wallet', async () => {
    const wallet: any = dashboardWalletFactory.build();
    const mnemonic = await wallet.toMnemonic();
    wallet.add(mnemonic);
    const keyType = 'secp256k1';
    const key0 = await wallet.toKeyPair(mnemonic.value, 0, keyType);
    const key1 = await wallet.toKeyPair(mnemonic.value, 1, keyType);
    const key2 = await wallet.toKeyPair(mnemonic.value, 2, keyType);
    const document: any = {
      publicKeys: [
        {
          id: key0.id.split('#').pop(),
          type: key0.type,
          publicKeyJwk: key0.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        },
      ],
      services: [
        {
          id: 'example-service',
          type: 'ExampleService',
          serviceEndpoint: 'https://example.com',
        },
      ],
    } as any;
    const recoveryKey = key1.publicKeyJwk;
    const updateKey = key2.publicKeyJwk;
    // create and resolve long form did
    const longFormDid2 = await wallet.createLongFormDid({
      method: 'elem',
      network: 'ganache',
      document,
      updateKey,
      recoveryKey,
    });
    // console.log(longFormDid2);
    // console.log(wallet);
    // const operation1 = await element.handleResolveRequest(longFormDid);

    // create and resolve long form did
    // const uniqueSuffix = longFormDid2.split(':')[3];
    // const did = `did:elem:ganache:${uniqueSuffix}`;
    // console.log(did);
    const input1 = { recoveryKey, updateKey, document };
    const op0 = await wallet.operations.create(input1);
    // console.log(JSON.stringify(op0));
    // const operation0 = await element.handleOperationRequest(
    //   Buffer.from(JSON.stringify(op0))
    // );
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 10 * 1000);
    // });
    // const operation1 = await element.handleResolveRequest(did);
    expect(op0).toBeTruthy();
  });
});
