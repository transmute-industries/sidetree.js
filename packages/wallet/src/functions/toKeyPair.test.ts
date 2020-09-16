import { toKeyPair } from './toKeyPair';

import { walletKeyPair } from '../__fixtures__';

it('can generate key pair Ed25519', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'Ed25519'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].Ed25519);
});

it('can generate key pair X25519', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'X25519'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].X25519);
});

it('can generate key pair secp256k1', async () => {
  const content = await toKeyPair(
    walletKeyPair.keypair[0].mnemonic,
    0,
    'secp256k1'
  );
  expect(content).toEqual(walletKeyPair.keypair[0].secp256k1);
});
