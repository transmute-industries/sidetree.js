import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import Web3 from 'web3';

jest.setTimeout(10 * 1000);

describe('Element', () => {
  let ledger: EthereumLedger;
  let element: Element;

  beforeAll(async () => {
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
    const testConfig = require('./element-config.json');
    const testVersionConfig = require('./element-version-config.json');
    const minimalConfig = Object.assign({}, testConfig);
    delete minimalConfig.databaseName;
    element = new Element(minimalConfig, testVersionConfig, ledger);
    expect(element).toBeDefined();
  });

  it('should initialize the element class', async () => {
    await element.initialize();
  });
});
