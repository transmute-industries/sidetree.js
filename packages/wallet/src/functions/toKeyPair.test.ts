import { toKeyPair } from './toKeyPair';

import { mnemonic_0, keypair_0, keypair_1 } from '../__fixtures__';

it('can generate key pair', async () => {
  const content = await toKeyPair(mnemonic_0.value, 0);
  expect(content).toEqual(keypair_0);
});

it('can generate key pair secp256k1', async () => {
  const content = await toKeyPair(
    mnemonic_0.value,
    0,
    'EcdsaSecp256k1Verification2018'
  );
  expect(content).toEqual(keypair_1);
});
