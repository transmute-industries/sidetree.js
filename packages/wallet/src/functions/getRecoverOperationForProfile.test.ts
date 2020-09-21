import { walletSvipOperation } from '../__fixtures__';

import { getRecoverOperationForProfile } from './getRecoverOperationForProfile';

it('can get recover operation from mnemonic', async () => {
  const didUniqueSuffix = (walletSvipOperation.operation[0]
    .createOperationWalletDidDoc.didDocument as any).id
    .split(':')
    .pop();
  const recoverOperation = await getRecoverOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    didUniqueSuffix
  );
  expect(recoverOperation).toEqual(
    walletSvipOperation.operation[0].recoverOperation
  );
});

it('can get recover operation from mnemonic with service', async () => {
  const didUniqueSuffix = (walletSvipOperation.operation[0]
    .createOperationWithPatchWalletDidDoc.didDocument as any).id
    .split(':')
    .pop();
  const recoverOperation = await getRecoverOperationForProfile(
    walletSvipOperation.operation[0].mnemonic,
    0,
    didUniqueSuffix,
    'SVIP',
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
    walletSvipOperation.operation[0].recoverOperationWithPatch
  );
});
