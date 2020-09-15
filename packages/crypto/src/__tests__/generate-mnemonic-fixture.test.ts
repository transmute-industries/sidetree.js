import { generateMnemonic } from '../mnemonic';
import { writeFixture } from '../test/util';

const count = 5;

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    mnemonic: [],
  };

  for (let i = 0; i < count; i++) {
    const m0 = await generateMnemonic();
    expect(m0).toBeDefined();
    fixture.mnemonic.push(m0);
  }

  //   uncomment to debug
  //   console.log(JSON.stringify(fixture, null, 2));

  expect(fixture.mnemonic.length).toBe(5);
  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('mnemonic.json', fixture);
  }
});
