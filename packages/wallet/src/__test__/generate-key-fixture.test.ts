import { crypto } from '@sidetree/test-vectors';

import { writeFixture } from '../test/util';
import { toKeyPair } from '../functions/toKeyPair';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    keypair: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];

    const kp = await toKeyPair(mnemonic, 0);
    console.log(kp);
  }

  //   uncomment to debug
  // console.log(JSON.stringify(fixture, null, 2));

  //   expect(fixture).toEqual(keypair);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('keypair.json', fixture);
  }
});
