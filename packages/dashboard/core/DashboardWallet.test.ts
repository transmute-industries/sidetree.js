import { dashboardWalletFactory } from './DashboardWallet';

describe('Dashboard Wallet', () => {
  it('creates wallet and operation create did', async () => {
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
    } as any;
    const recoveryKey = key1.publicKeyJwk;
    const updateKey = key2.publicKeyJwk;
    const input1 = { recoveryKey, updateKey, document };
    const op0 = await wallet.operations.create(input1);
    expect(op0).toBeTruthy();
  });
});
