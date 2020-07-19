import {
  OperationGenerator,
  // CreateOperation, Jwk
} from '@sidetree/core';
import { EthereumLedger } from '@sidetree/ledger';
import {
  Config,
  //  Multihash
} from '@sidetree/common';
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
  await element.initialize();
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
  await element.close();
});

it('should get versions', async () => {
  const versions = await element.handleGetVersionRequest();
  expect(versions.status).toBe('succeeded');
  expect(JSON.parse(versions.body)).toHaveLength(3);
});

it('sanity', async () => {
  const create = await OperationGenerator.generateCreateOperation();
  const update = await OperationGenerator.generateUpdateOperation(
    create.createOperation.didUniqueSuffix,
    create.updatePublicKey,
    create.updatePrivateKey
  );
  expect(create).toBeDefined();
  expect(update).toBeDefined();
  let operation = await element.handleOperationRequest(
    create.createOperation.operationBuffer
  );
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
  let txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
  console.log(JSON.stringify(operation, null, 2));
  operation = await element.handleOperationRequest(
    update.updateOperation.operationBuffer
  );
  expect(operation.status).toBe('succeeded');
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
  txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  let ops = await element.operationStore.get(
    create.createOperation.didUniqueSuffix
  );
  expect(ops.length).toBe(2);
  operation = await element.handleResolveRequest(
    `did:elem:${create.createOperation.didUniqueSuffix}`
  );
  console.log(JSON.stringify(operation, null, 2));
});
