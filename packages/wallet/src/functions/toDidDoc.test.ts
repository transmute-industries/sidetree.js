import { toDidDoc } from './toDidDoc';

import { walletOperation } from '../__fixtures__';

it('can generate did doc', async () => {
  const content = await toDidDoc(
    walletOperation.operation[0].mnemonic,
    0,
    'elem'
  );
  expect(content).toEqual(
    walletOperation.operation[0].createOperationWalletDidDoc
  );
});
