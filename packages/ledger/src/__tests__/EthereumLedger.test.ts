import { EthereumLedger } from '..';
import testSuite from './testSuite';
import { web3, logger } from '../__fixtures__';

const ledger = new EthereumLedger(
  web3,
  '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
  logger
);

beforeAll(async () => {
  await ledger._createNewContract();
});

testSuite(ledger);
