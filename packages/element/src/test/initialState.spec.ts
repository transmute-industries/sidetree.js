import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import { OperationGenerator, CreateOperation } from '@sidetree/core';
import { Config } from '@sidetree/common';
import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import {
  recoveryPublicKey,
  signingPublicKey,
  services,
  resolveBody,
} from './fixtures';

jest.setTimeout(15 * 1000);

console.info = () => null;

describe('Element', () => {
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    await element.close();
  });

  it('should create the element class', async () => {
    const testVersionConfig = require('./element-version-config.json');
    element = new Element(config, testVersionConfig, ledger);
    await element.initialize();
    expect(element).toBeDefined();
  });

  it('should handle operation request', async () => {
    const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
      recoveryPublicKey,
      signingPublicKey,
      services
    );
    const createOperation = await CreateOperation.parse(createOperationBuffer);
    const didMethodName = config.didMethodName;
    const didUniqueSuffix = createOperation.didUniqueSuffix;
    const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
    const encodedSuffixData = createOperation.encodedSuffixData;
    const encodedDelta = createOperation.encodedDelta;
    const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
    const operation = await element.handleResolveRequest(longFormDid);
    (resolveBody.didDocument['@context'][1] as any)['@base'] = longFormDid;
    resolveBody.didDocument.id = longFormDid;
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });
});
