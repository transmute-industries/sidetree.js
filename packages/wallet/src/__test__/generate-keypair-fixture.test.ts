import { crypto } from '@sidetree/test-vectors';

import { writeFixture } from '../test/util';
import { toKeyPair } from '../functions/toKeyPair';

import { walletKeyPair } from '../__fixtures__';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    keypair: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];
    const kp0 = await toKeyPair(mnemonic, 0, 'Ed25519');
    const kp1 = await toKeyPair(mnemonic, 0, 'X25519');
    const kp2 = await toKeyPair(mnemonic, 0, 'secp256k1');
    fixture.keypair.push({
      mnemonic,
      Ed25519: kp0,
      X25519: kp1,
      secp256k1: kp2,
    });
  }

  //   uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  expect(fixture).toEqual(walletKeyPair);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-keypair.json', fixture);
  }
});
