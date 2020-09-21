import { toMnemonic } from './toMnemonic';

import { walletMnemonic } from '../__fixtures__';

it('can generate a mnemonic', async () => {
  const content = await toMnemonic();
  expect(content.type).toBe(walletMnemonic.mnemonic[0].content.type);
  expect(content.name).toBe(walletMnemonic.mnemonic[0].content.name);
  expect(content.image).toBe(walletMnemonic.mnemonic[0].content.image);
  expect(content.description).toBe(
    walletMnemonic.mnemonic[0].content.description
  );
});

it('can generate a mnemonic from a value', async () => {
  const content = await toMnemonic(walletMnemonic.mnemonic[0].mnemonic);
  expect(content).toEqual(walletMnemonic.mnemonic[0].content);
});
