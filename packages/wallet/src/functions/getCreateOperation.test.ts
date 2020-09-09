import * as fixtures from '../__fixtures__';

import { getCreateOperation } from './getCreateOperation';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperation(
    fixtures.mnemonic_0.value,
    0
  );
  expect(createOperation).toEqual(
    fixtures.sidetree_data_model_fixtures.keypair_0_create_operation
  );
});

it('can get create operation with service endpoints', async () => {
  const createOperation = await getCreateOperation(
    fixtures.mnemonic_0.value,
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
  expect(createOperation).toEqual(
    fixtures.sidetree_data_model_fixtures.keypair_0_crete_operation_with_service
  );
});
