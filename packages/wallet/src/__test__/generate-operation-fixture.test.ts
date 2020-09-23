import { crypto } from '@sidetree/test-vectors';

import { writeFixture } from '../test/util';
import { getCreateOperation } from '../functions/getCreateOperation';
import { getRecoverOperation } from '../functions/getRecoverOperation';
import { toDidDoc } from '../functions/toDidDoc';

import { walletOperation } from '../__fixtures__';

const WRITE_FIXTURE_TO_DISK = false;

it('can generate test fixture', async () => {
  const fixture: any = {
    operation: [],
  };

  for (let i = 0; i < crypto.mnemonic.mnemonic.length; i++) {
    const mnemonic = crypto.mnemonic.mnemonic[i];
    const createOperation = await getCreateOperation(mnemonic, 0);
    const createOperationWithPatch = await getCreateOperation(mnemonic, 0, {
      service_endpoints: [
        {
          id: 'resolver-0',
          type: 'Resolver',
          endpoint: 'https://example.com',
        },
      ],
    });
    const createOperationWalletDidDoc = await toDidDoc(mnemonic, 0, 'elem');
    const recoverOperation = await getRecoverOperation(
      mnemonic,
      0,
      (createOperationWalletDidDoc.didDocument as any).id.split(':').pop()
    );
    const recoverOperationWithPatch = await getRecoverOperation(
      mnemonic,
      0,
      (createOperationWalletDidDoc.didDocument as any).id.split(':').pop(),
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

    fixture.operation.push({
      mnemonic,
      createOperation,
      createOperationWithPatch,
      createOperationWalletDidDoc,
      recoverOperation,
      recoverOperationWithPatch,
    });
  }

  expect(fixture).toEqual(walletOperation);

  if (WRITE_FIXTURE_TO_DISK) {
    writeFixture('wallet-operation.json', fixture);
  }
});
