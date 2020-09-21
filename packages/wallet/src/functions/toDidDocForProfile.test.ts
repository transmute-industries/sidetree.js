import { toDidDocForProfile } from './toDidDocForProfile';

import { walletSvipOperation } from '../__fixtures__';

it('can generate did doc', async () => {
  const content = await toDidDocForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    'elem',
    'SVIP',
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

  expect(content).toEqual(
    walletSvipOperation.operation[0].createOperationWithPatchWalletDidDoc
  );
});
