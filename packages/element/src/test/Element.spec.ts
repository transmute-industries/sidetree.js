import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';
import Web3 from 'web3';

describe('Element', () => {
  it('should', async () => {
    const testConfig = require('./element-config.json');
    const testVersionConfig = require('./element-version-config.json');
    const minimalConfig = Object.assign({}, testConfig);
    delete minimalConfig.databaseName;
    const provider = 'http://localhost:8545';
    const web3 = new Web3(provider);
    const blockchain = new EthereumLedger(
      web3,
      '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
      console
    );
    const element = new Element(minimalConfig, testVersionConfig, blockchain);
    expect(element).toBeDefined();
  });
});
