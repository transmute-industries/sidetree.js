import { crypto } from '@sidetree/test-vectors';

import { writeFixture } from '../test/util';
import { toMnemonic } from '../functions/toMnemonic';

import { walletMnemonic } from '../__fixtures__';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    mnemonic: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];
    const content = await toMnemonic(mnemonic);
    fixture.mnemonic.push({
      mnemonic,
      content,
    });
  }

  expect(fixture).toEqual(walletMnemonic);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-mnemonic.json', fixture);
  }
});
