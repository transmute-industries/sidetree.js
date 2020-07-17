import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';

import { create } from '../__fixtures__/trustbloc-test-vectors';

import { config, testVersionConfig } from '../__fixtures__';

jest.setTimeout(15 * 1000);

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
  console.log(operation);
  // expect(operation).toEqual(JSON.parse(resolveBodyAfterCreate));
});

// it('should resolve a did after Observer has picked up the transaction', async () => {
//   await element.triggerBatchWriting();
//   await element.triggerProcessTransactions();
//   await new Promise((resolve) => setTimeout(resolve, 10000));
//   const operation = await element.handleResolveRequest(shortFormDid);
//   //   expect(operation).toEqual(JSON.parse(resolveBodyAfterCreate));
// });
