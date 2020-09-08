import Element from '../Element';
import { EthereumLedger } from '@sidetree/ethereum';
import { resetDatabase, getTestLedger } from '../test/utils';
import config from '../test/element-config.json';

import { wallet } from './index';

let ledger: EthereumLedger;
let element: Element;

beforeAll(async () => {
  await resetDatabase();
  ledger = await getTestLedger();
  element = new Element(config, config.versions, ledger);
  await element.initialize(false, false);
});

afterAll(async () => {
  await element.close();
});

it('kill me now', async () => {
  // console.log(wallet);
  const mnemonc =
    'exile flight define return spring jazz absorb lens always fatigue wheat absorb';
  const mnemonic_content = await wallet.toMnemonic(mnemonc);
  const createOperation = await wallet.getCreateOperation(
    mnemonic_content.value,
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
  let response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(createOperation))
  );
  expect(response.body.didDocument.publicKey[0].id).toBe(
    '#hOe3i-Yby1YXeP9tA0fpLBK6fVucRiC41uZU9SHLQ14'
  );
  const did = response.body.didDocument.id;
  const didUniqueSuffix = did.split(':').pop();
  await element.triggerBatchAndObserve();
  response = await element.handleResolveRequest(did);
  expect(response.body.didDocument.publicKey[0].id).toBe(
    '#hOe3i-Yby1YXeP9tA0fpLBK6fVucRiC41uZU9SHLQ14'
  );

  expect(response.body.didDocument.service[0].id).toBe('#resolver-0');

  const recoverOperation = await wallet.getRecoverOperation(
    mnemonic_content.value,
    0,
    didUniqueSuffix,
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

  response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(recoverOperation))
  );
  await element.triggerBatchAndObserve();
  response = await element.handleResolveRequest(did);
  expect(response.body.didDocument.publicKey[0].id).toBe(
    '#P-Kkfp-DMI-SbtoeA05Wd196Zkeaf6EucW4E-m-V99I'
  );
  expect(response.body.didDocument.service[0].id).toBe('#resolver-1');
});
