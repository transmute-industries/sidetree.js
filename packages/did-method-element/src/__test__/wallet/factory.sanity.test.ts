import { SidetreeWalletPlugin } from '@evan.network/sidetree-wallet';

it('can get factory instance', async () => {
  const wallet = SidetreeWalletPlugin.build();
  expect(wallet.operations).toBeDefined();
});
