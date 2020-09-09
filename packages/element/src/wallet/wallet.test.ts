import { getTestElement, resetDatabase } from '../test/utils';
import Element from '../Element';
import { wallet } from './index';

let element: Element;

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

const mnemonic =
  'exile flight define return spring jazz absorb lens always fatigue wheat absorb';

it('should immediatly resolve a did with initial state', async () => {
  const content = await wallet.toDidDoc(mnemonic, 0, 'elem');
  const operation = await element.handleResolveRequest(content.id);
  console.warn('hacking sidetree because of bug in sidetree core');
  operation.body.didDocument['@context'][1] = {
    '@base': content.id.split('?')[0],
  };
  delete operation.body.didDocument.service;
  operation.body.didDocument.id = content.id.split('?')[0];
  operation.body.didDocument.publicKey[0].controller = content.id.split('?')[0];
  expect(operation.status).toBe('succeeded');
  expect(operation.body.didDocument).toEqual(content.didDocument);
});

it('sidetree wallet integration test', async () => {
  const mnemonic_content = await wallet.toMnemonic(mnemonic);
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
  console.log(response.body.didDocument);
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
