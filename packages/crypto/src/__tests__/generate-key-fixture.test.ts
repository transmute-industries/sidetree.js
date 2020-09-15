import { toKeyPair } from '../mnemonic';

import { mnemonic, keypair } from '../__fixtures__';
import { writeFixture } from '../test/util';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    keypair: [],
  };

  for (let i = 0; i < mnemonic.mnemonic.length; i++) {
    const m0 = mnemonic.mnemonic[i];
    const k0 = await toKeyPair(m0, 0, 'Ed25519');
    const k1 = await toKeyPair(m0, 0, 'X25519');
    const k2 = await toKeyPair(m0, 0, 'secp256k1');

    expect(k0).toBeDefined();
    expect(k1).toBeDefined();
    expect(k2).toBeDefined();
    fixture.keypair.push({
      mnemonic: m0,
      Ed25519: [k0.toKeyPair(true), k0.toJsonWebKeyPair(true)],
      X25519: [k1.toKeyPair(true), k1.toJsonWebKeyPair(true)],
      secp256k1: [k2.toKeyPair(true), k2.toJsonWebKeyPair(true)],
    });
  }

  //   uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  expect(fixture).toEqual(keypair);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('keypair.json', fixture);
  }
});
