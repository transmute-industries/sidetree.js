import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import * as fs from 'fs';
import * as path from 'path';

jest.setTimeout(20 * 1000);

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
  const testVersionConfig = require('./element-version-config.json');
  element = new Element(config, testVersionConfig, ledger);
  await element.initialize(false, false);
});

afterAll(async () => {
  await element.close();
});

it('should get versions', async () => {
  const versions = await element.handleGetVersionRequest();
  expect(versions.status).toBe('succeeded');
  expect(JSON.parse(versions.body)).toHaveLength(3);
});

it('should handle create operation', async () => {
  const create = fs.readFileSync(
    path.resolve(__dirname, './__fixtures__/interop/update/create.json')
  );
  const operation = await element.handleOperationRequest(create);
  expect(operation.status).toBe('succeeded');
});

it('should resolve after create', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  const operation = await element.handleResolveRequest(
    'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
  );
  expect(operation.status).toBe('succeeded');
});

it('should handle update operation', async () => {
  const update = fs.readFileSync(
    path.resolve(__dirname, './__fixtures__/interop/update/update.json')
  );
  const operation = await element.handleOperationRequest(update);
  expect(operation.status).toBe('succeeded');
});

it('should resolve after update', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  const operation = await element.handleResolveRequest(
    'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
  );
  expect(operation.status).toBe('succeeded');
  expect(operation.body.didDocument.publicKey[1].id).toBe('#new-key1');
});
