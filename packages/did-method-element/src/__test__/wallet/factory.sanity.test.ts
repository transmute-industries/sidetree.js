import { SidetreeWalletPlugin } from '@sidetree/wallet';

it('can get factory instance', async () => {
  const wallet = SidetreeWalletPlugin.build();
  expect(wallet.operations).toBeDefined();
});
