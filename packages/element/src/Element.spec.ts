import Element from './Element';
import { EthereumLedger } from '@sidetree/ledger';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';

import { config, testVersionConfig } from './__fixtures__';

let ledger: EthereumLedger;
let element: Element;

jest.setTimeout(15 * 1000);

console.info = () => null;

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
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await element.close();
});

it('should create the element class', async () => {
  element = new Element(config, testVersionConfig, ledger);
  expect(element).toBeDefined();
});

it('should initialize the element class', async () => {
  await element.initialize();
});

it('should get versions', async () => {
  const versions = await element.handleGetVersionRequest();
  expect(versions.status).toBe('succeeded');
  expect(JSON.parse(versions.body)).toHaveLength(3);
});
