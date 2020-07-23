import { OperationGenerator } from '@sidetree/core';
import { EthereumLedger } from '@sidetree/ledger';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import Element from '../Element';

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

it('sanity', async () => {
  const create = await OperationGenerator.generateCreateOperation();
  const deactivate = await OperationGenerator.createDeactivateOperation(
    create.createOperation.didUniqueSuffix,
    create.recoveryPrivateKey
  );

  expect(create).toBeDefined();
  expect(deactivate).toBeDefined();

  let operation = await element.handleOperationRequest(
    create.createOperation.operationBuffer
  );
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  let txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
  operation = await element.handleOperationRequest(deactivate.operationBuffer);
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  const ops = await element.operationStore.get(
    create.createOperation.didUniqueSuffix
  );
  expect(ops.length).toBe(2);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
  expect(operation.body.status).toBe('deactivated');
});
