import * as fixtures from '../__fixtures__';

import { getRecoverOperation } from './getRecoverOperation';

it('can get recover operation from mnemonic', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    (fixtures.walletOperation.operation[0].createOperationWalletDidDoc
      .didDocument as any).id
      .split(':')
      .pop()
  );

  expect(recoverOperation).toEqual(
    fixtures.walletOperation.operation[0].recoverOperation
  );
});

it('can get recover operation from mnemonic with service', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    (fixtures.walletOperation.operation[0].createOperationWalletDidDoc
      .didDocument as any).id
      .split(':')
      .pop(),
    {
      service_endpoints: [
        {
          id: 'resolver-1',
          type: 'Resolver',
          endpoint: 'https://example.com',
        },
      ],
    }
  );

  expect(recoverOperation).toEqual(
    fixtures.walletOperation.operation[0].recoverOperationWithPatch
  );
});
