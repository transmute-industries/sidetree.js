import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import { longFormDid, longFormResolveBody } from '../__fixtures__/test-vectors';
import { config, testVersionConfig } from '../__fixtures__';

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
});

afterAll(async () => {
  await element.close();
});

it('should create the element class', async () => {
  element = new Element(config, testVersionConfig, ledger);
  await element.initialize();
  expect(element).toBeDefined();
});

it('should immediatly resolve a did with initial state', async () => {
  const operation = await element.handleResolveRequest(longFormDid);
  expect(operation).toEqual(JSON.parse(longFormResolveBody));
});
