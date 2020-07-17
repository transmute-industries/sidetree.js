import { OperationGenerator, CreateOperation, Jwk } from '@sidetree/core';
import { EthereumLedger } from '@sidetree/ledger';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import Element from '../Element';

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

let didUniqueSuffix: string;
let createOperation: CreateOperation;
let signingPublicKey: any;
let recoveryPublicKey: any;
let signingPrivateKey: any;
let recoveryPrivateKey: any;

it('should handle create operation', async () => {
  [recoveryPublicKey, recoveryPrivateKey] = await Jwk.generateEs256kKeyPair();
  [
    signingPublicKey,
    signingPrivateKey,
  ] = await OperationGenerator.generateKeyPair('key2');
  console.log(recoveryPrivateKey);
  const services = OperationGenerator.generateServiceEndpoints([
    'serviceEndpointId123',
  ]);
  const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
    recoveryPublicKey,
    signingPublicKey,
    services
  );
  const operation = await element.handleOperationRequest(createOperationBuffer);
  createOperation = await CreateOperation.parse(createOperationBuffer);
  didUniqueSuffix = createOperation.didUniqueSuffix;
  expect(operation.status).toBe('succeeded');
});

it('should resolve after create', async () => {
  await element.triggerBatchWriting();
  await element.triggerProcessTransactions();
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const operation = await element.handleResolveRequest(
    `did:elem:${didUniqueSuffix}`
  );
  expect(operation.status).toBe('succeeded');
  console.log(JSON.stringify(operation, null, 2));
});

// it('should handle update operation', async () => {
//   const updateOperationBuffer = await OperationGenerator.generateUpdateOperation(
//     didUniqueSuffix,
//     signingPublicKey,
//     signingPrivateKey
//   );
//   console.log(updateOperationBuffer);
//   // const operation = await element.handleOperationRequest(
//   //   fs.readFileSync(
//   //     path.resolve(__dirname, './__fixtures__/interop/update/update.json')
//   //   )
//   // );
//   // expect(operation.status).toBe('succeeded');
// });

// it('should resolve after update', async () => {
//   await element.triggerBatchWriting();
//   await element.triggerProcessTransactions();
//   await new Promise((resolve) => setTimeout(resolve, 10000));
//   const operation = await element.handleResolveRequest(
//     'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
//   );
//   expect(operation.status).toBe('succeeded');
//   console.warn('should contain new-key1', JSON.stringify(operation, null, 2));
// });
