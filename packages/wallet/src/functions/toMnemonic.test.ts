import { toMnemonic } from './toMnemonic';

import { mnemonic_0 } from '../__fixtures__';

it('can generate a mnemonic', async () => {
  const content = await toMnemonic();
  expect(content.type).toBe(mnemonic_0.type);
  expect(content.name).toBe(mnemonic_0.name);
  expect(content.image).toBe(mnemonic_0.image);
  expect(content.description).toBe(mnemonic_0.description);
});

it('can generate a mnemonic from a value', async () => {
  const content = await toMnemonic(mnemonic_0.value);
  expect(content).toEqual(mnemonic_0);
});
