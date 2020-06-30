import Element from '../Element';
import { EthereumLedger } from '@sidetree/ledger';

describe('Element', () => {
  it('should', async () => {
    const testConfig = require('./element-config.json');
    const testVersionConfig = require('./element-version-config.json');
    const minimalConfig = Object.assign({}, testConfig);
    delete minimalConfig.databaseName;
    const blockchain = new EthereumLedger();
    const element = new Element(minimalConfig, testVersionConfig);
    console.log(element);
  });
});
