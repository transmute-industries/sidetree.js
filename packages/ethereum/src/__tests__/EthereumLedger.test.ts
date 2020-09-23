import { testSuite } from '@sidetree/ledger';
import { EthereumLedger } from '..';
import { web3 } from './web3';

const { name, version } = require('../../package.json');

const ledger = new EthereumLedger(web3);

beforeAll(async () => {
  await ledger.initialize();
});

it('should get service version', async () => {
  const serviceVersion = await ledger.getServiceVersion();
  expect(serviceVersion).toBeDefined();
  expect(serviceVersion.name).toBe(name);
  expect(serviceVersion.version).toBe(version);
});

testSuite(ledger);
