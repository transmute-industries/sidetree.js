import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { Jwk, OperationGenerator, CreateOperation } from '@sidetree/core';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';

jest.setTimeout(15 * 1000);

describe('Element', () => {
  let ledger: EthereumLedger;
  let element: Element;
  let did: string;
  const config: Config = require('./element-config.json');
  const didMethodName = config.didMethodName;

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
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  it('should handle operation request', async () => {
    const [
      recoveryPublicKey,
      // recoveryPrivateKey,
    ] = await Jwk.generateEs256kKeyPair();
    const [signingPublicKey] = await OperationGenerator.generateKeyPair('key2');
    const services = OperationGenerator.generateServiceEndpoints([
      'serviceEndpointId123',
    ]);
    const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
      recoveryPublicKey,
      signingPublicKey,
      services
    );
    const operation = await element.handleOperationRequest(
      createOperationBuffer
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toBeDefined();
    expect(operation.body.methodMetadata).toBeDefined();
    expect(operation.body.didDocument).toBeDefined();
    const createOperation = await CreateOperation.parse(createOperationBuffer);
    const didUniqueSuffix = createOperation.didUniqueSuffix;
    did = `did:${didMethodName}:${didUniqueSuffix}`;
    expect(operation.body.didDocument.id).toBe(did);
    expect(operation.body.didDocument['@context']).toBeDefined();
    expect(operation.body.didDocument.service[0].id).toContain(services[0].id);
    expect(operation.body.didDocument.publicKey[0].id).toContain(
      signingPublicKey.id
    );
  });

  it('should resolve a did after Observer has picked up the transaction', async () => {
    await element.triggerBatchWriting();
    await element.triggerProcessTransactions();
    await new Promise(resolve => setTimeout(resolve, 10000));
    const operation = await element.handleResolveRequest(did);
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toBeDefined();
    expect(operation.body.methodMetadata).toBeDefined();
    expect(operation.body.didDocument).toBeDefined();
    expect(operation.body.didDocument.id).toBe(did);
    expect(operation.body.didDocument['@context']).toBeDefined();
    expect(operation.body.didDocument.service).toHaveLength(1);
    expect(operation.body.didDocument.publicKey).toHaveLength(1);
  });
});
