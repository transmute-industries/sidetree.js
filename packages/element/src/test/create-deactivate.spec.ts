import { EthereumLedger } from '@sidetree/ledger';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import Element from '../Element';
import {
  shortFormDid,
  createOperationBuffer,
  resolveBody,
  deactivateOperationBuffer,
} from './__fixtures__';

jest.setTimeout(40 * 1000);
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

it('should create a did', async () => {
  const createOperation = await element.handleOperationRequest(
    createOperationBuffer
  );
  expect(createOperation.status).toBe('succeeded');
  expect(createOperation.body).toEqual(resolveBody);
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  const resolveRequest = await element.handleResolveRequest(shortFormDid);
  expect(resolveRequest.body).toEqual(resolveBody);
});

it('should deactivate a did', async () => {
  const deactivateOperation = await element.handleOperationRequest(
    deactivateOperationBuffer
  );
  expect(deactivateOperation.status).toBe('succeeded');
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const didUniqueSuffix = shortFormDid.split(':').pop();
  console.log({ didUniqueSuffix });
  const ops = await element.operationStore.get(didUniqueSuffix!);
  expect(ops.length).toBe(2);
  const resolveRequest = await element.handleResolveRequest(shortFormDid);
  expect(resolveRequest.body.status).toBe('deactivated');
});
