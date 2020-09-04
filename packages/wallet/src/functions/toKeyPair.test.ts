import { toKeyPair } from './toKeyPair';

import { mnemonic_0, keypair_0 } from '../__fixtures__';

it('can generate key pair', async () => {
  const content = await toKeyPair(mnemonic_0.value, 0);
  expect(content).toEqual(keypair_0);
});
