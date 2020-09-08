import * as fixtures from '../__fixtures__';

import { getRecoverOperation } from './getRecoverOperation';

it('can get recover operation from mnemonic', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.mnemonic_0.value,
    0,
    'EiAVh3lQ5Yosi7p6OP9HlBVnZ8H68LDf9qkFIgqw_JVnrg'
  );

  expect(recoverOperation).toEqual(
    fixtures.sidetree_data_model_fixtures.keypair_0_recover_operation
  );
});

it('can get recover operation from mnemonic with service', async () => {
  const recoverOperation = await getRecoverOperation(
    fixtures.mnemonic_0.value,
    0,
    'EiAVh3lQ5Yosi7p6OP9HlBVnZ8H68LDf9qkFIgqw_JVnrg',
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
    fixtures.sidetree_data_model_fixtures
      .keypair_0_recover_operation_with_service
  );
});
