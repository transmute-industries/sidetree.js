import * as wallet from '../index';
import * as fixtures from '../__fixtures__';

it('generateMnemonic', async () => {
  const mnemonic: string = await wallet.generateMnemonic();
  expect(mnemonic).toBeDefined();
});

it('Mnemonic toUniversalWalletDataModel', async () => {
  const mnemonicContent = await wallet.toUniversalWalletDataModel(
    'Mnemonic',
    fixtures.mnemonic
  );
  expect(mnemonicContent).toEqual(fixtures.mnemonicContent);
});

it('getLinkedDataKeyPairsAtIndex', async () => {
  const keyPairs = await wallet.getLinkedDataKeyPairsAtIndex(
    fixtures.mnemonicContent,
    0
  );
  expect(keyPairs.length).toBe(2);
});

it('initial state', async () => {
  const data = await wallet.getLinkedDataKeyPairsAtIndex(
    fixtures.mnemonicContent,
    0
  );
  const initialState = await wallet.toInitialState(data[1]);
  expect(initialState).toBe(fixtures.initialState);
});

it('walletContents at event number', async () => {
  const derivedWalletContents = await wallet.getDerivedWalletContent(
    fixtures.mnemonicContent,
    0
  );
  expect(derivedWalletContents).toEqual(fixtures.derivedWalletContents);
});
