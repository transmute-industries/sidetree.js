import { dashboardWalletFactory } from './DashboardWallet';
import * as Sidetree from '@sidetree/wallet';

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

  // API DID ACTOR KEY CREATION SANITY CHECK
  // This test confirms the dashboardWalletFactory.toKeyPair() and @sidetree/wallet's toKeyPair()
  // generate the exact same keys as API did actor when using the same parameters.
  it('ensure same did:key gets created here as in api.did.actor using same params', async () => {
    const mnemonic =
      'walnut zoo hamster tumble just smooth post myth task thought finger illegal';
    const wallet: any = dashboardWalletFactory.build();
    const content = await wallet.toKeyPair(
      mnemonic,
      0,
      'secp256k1',
      "m/44'/0'/0'/0/0"
    );
    const content2 = await Sidetree.toKeyPair(
      mnemonic,
      0,
      'secp256k1',
      "m/44'/0'/0'/0/0"
    );
    expect(content2?.controller).toEqual(content.controller);
    expect(content2?.controller).toEqual(
      'did:key:zQ3shjEgDKdK5bBU6Y9GhtZndZ7YTh4KkE2Ff22Xv36RGbKJC'
    );
  });

  // This test ensures that the same wallet.toKeyPair() function running on https://photon.transmute.industries/create
  // inside the create.ts file generates the same key0 when using the same inputs
  // Currently busted as it seems https://photon.transmute.industries/create generates the same key
  // regardless of inputs
  // THIS TEST CURRENTLY FAILS
  xit('ensure same did:key gets created here as in @wallet package using exact same inputs', async () => {
    const mnemonic =
      'life state degree blade flower festival absurd anger rifle property upon time';
    const wallet: any = dashboardWalletFactory.build();
    const content = await wallet.toKeyPair(
      mnemonic,
      0,
      'secp256k1',
      "m/44'/1'/0'/0/0"
    );
    const content2 = await Sidetree.toKeyPair(
      mnemonic,
      0,
      'secp256k1',
      "m/44'/1'/0'/0/0"
    );
    expect(content2?.controller).toEqual(content.controller);
    expect(content.controller).toEqual(
      'did:key:zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp'
    );
  });
});
