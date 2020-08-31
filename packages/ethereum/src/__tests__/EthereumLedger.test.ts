import { EthereumLedger } from '..';
import { testSuite } from '@sidetree/ledger';
import { ledger as fixtures } from '@sidetree/test-vectors';
import { web3 } from './web3';

const { logger } = fixtures;

const ledger = new EthereumLedger(
  web3,
  '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
  logger
);

beforeAll(async () => {
  await ledger._createNewContract();
});

testSuite(ledger);
