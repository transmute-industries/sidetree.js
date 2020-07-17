import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import * as fs from 'fs';
import * as path from 'path';

jest.setTimeout(15 * 1000);

console.info = () => null;

let ledger: EthereumLedger;
let element: Element;
const config: Config = require('./element-config.json');

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
  const testVersionConfig = require('./element-version-config.json');
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

it('should handle create operation', async () => {
  const operation = await element.handleOperationRequest(
    fs.readFileSync(
      path.resolve(__dirname, './__fixtures__/interop/update/create.json')
    )
  );
  //   console.log(JSON.stringify(operation, null, 2));
  expect(operation.status).toBe('succeeded');
});

it('should resolve after create', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const operation = await element.handleResolveRequest(
    'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
  );
  expect(operation.status).toBe('succeeded');
  //   console.log(JSON.stringify(operation, null, 2));
});

it('should handle update operation', async () => {
  const operation = await element.handleOperationRequest(
    fs.readFileSync(
      path.resolve(__dirname, './__fixtures__/interop/update/update.json')
    )
  );
  expect(operation.status).toBe('succeeded');
});

it('should resolve after update', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const operation = await element.handleResolveRequest(
    'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
  );
  expect(operation.status).toBe('succeeded');
  console.warn('should contain new-key1', JSON.stringify(operation, null, 2));
});
