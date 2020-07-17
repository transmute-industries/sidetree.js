import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';

import { did, create, update } from '../__fixtures__/trustbloc-test-vectors';

import { config, testVersionConfig } from '../__fixtures__';

jest.setTimeout(20 * 1000);

console.info = () => null;

let ledger: EthereumLedger;
let element: Element;

beforeAll(async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
  const provider = 'http://localhost:8545';
  const web3 = new Web3(provider);
  ledger = new EthereumLedger(
    web3,
    '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
    console
  );
  await ledger._createNewContract();

  element = new Element(config, testVersionConfig, ledger);
  await element.initialize();
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await element.close();
});

it('should handle create request', async () => {
  const operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(create))
  );
  expect(operation.status).toBe('succeeded');
});

it('should resolve after create', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const operation = await element.handleResolveRequest(did);
  console.log(JSON.stringify(operation, null, 2));
  //   expect(operation).toEqual(JSON.parse(resolveBodyAfterCreate));
});

it('should handle update request', async () => {
  const operation = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(update))
  );
  console.log(JSON.stringify(operation, null, 2));
  expect(operation.status).toBe('succeeded');
});

it('should resolve after update', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const operation = await element.handleResolveRequest(did);
  console.log(JSON.stringify(operation, null, 2));
  //   expect(operation).toEqual(JSON.parse(resolveBodyAfterCreate));
});
