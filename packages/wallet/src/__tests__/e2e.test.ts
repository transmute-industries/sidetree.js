import * as wallet from '../index';
import * as fixtures from '../__fixtures__';

it('generateMnemonic', async () => {
  let mnemonic: string = await wallet.generateMnemonic();
  expect(mnemonic).toBeDefined();
});

it('Mnemonic toUniversalWalletDataModel', async () => {
  let mnemonicContent = await wallet.toUniversalWalletDataModel(
    'Mnemonic',
    fixtures.mnemonic
  );
  expect(mnemonicContent).toEqual(fixtures.mnemonicContent);
});

it('getLinkedDataKeyPairsAtIndex', async () => {
  let keyPairs = await wallet.getLinkedDataKeyPairsAtIndex(
    fixtures.mnemonicContent,
    0
  );
  expect(keyPairs.length).toBe(2);
});

it('initial state', async () => {
  let data = await wallet.getLinkedDataKeyPairsAtIndex(
    fixtures.mnemonicContent,
    0
  );
  let initialState = await wallet.toInitialState(data[1]);
  expect(initialState).toBe(fixtures.initialState);
});

it('walletContents at event number', async () => {
  let derivedWalletContents = await wallet.getDerivedWalletContent(
    fixtures.mnemonicContent,
    0
  );
  expect(derivedWalletContents).toEqual(fixtures.derivedWalletContents);
});
