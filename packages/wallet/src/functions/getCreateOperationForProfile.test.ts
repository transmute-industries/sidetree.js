import { walletSvipOperation } from '../__fixtures__';

import { getCreateOperationForProfile } from './getCreateOperationForProfile';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    'SVIP'
  );
  expect(createOperation).toEqual(
    walletSvipOperation.operation[0].createOperation
  );
});
