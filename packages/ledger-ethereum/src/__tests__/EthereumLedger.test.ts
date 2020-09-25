import { testSuite } from '@sidetree/ledger';
import { EthereumLedger } from '..';
import { web3 } from './web3';

const { version } = require('../../package.json');

const ledger = new EthereumLedger(web3);

beforeAll(async () => {
  await ledger.initialize();
});

it('should get service version', async () => {
  const serviceVersion = await ledger.getServiceVersion();
  expect(serviceVersion).toBeDefined();
  expect(serviceVersion.name).toBe('ethereum');
  expect(serviceVersion.version).toBe(version);
});

testSuite(ledger);
