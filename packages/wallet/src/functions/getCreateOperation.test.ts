import * as fixtures from '../__fixtures__';

import { getCreateOperation } from './getCreateOperation';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0
  );
  expect(createOperation).toEqual(
    fixtures.walletOperation.operation[0].createOperation
  );
});

it('can get create operation with service endpoints', async () => {
  const createOperationWithPatch = await getCreateOperation(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    {
      service_endpoints: [
        {
          id: 'resolver-0',
          type: 'Resolver',
          endpoint: 'https://example.com',
        },
      ],
    }
  );
  expect(createOperationWithPatch).toEqual(
    fixtures.walletOperation.operation[0].createOperationWithPatch
  );
});
