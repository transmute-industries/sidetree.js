import { toDidDoc } from './toDidDoc';

import { mnemonic_0, did_0 } from '../__fixtures__';

it('can generate did doc', async () => {
  const content = await toDidDoc(mnemonic_0.value, 0, 'elem');
  expect(content).toEqual(did_0);
});
