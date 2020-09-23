import { EthereumLedger } from '..';
import { testSuite } from '@sidetree/ledger';
import { web3 } from './web3';

const ledger = new EthereumLedger(web3);

beforeAll(async () => {
  await ledger.initialize();
});

testSuite(ledger);
