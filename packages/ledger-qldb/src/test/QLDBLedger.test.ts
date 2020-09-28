import { testSuite } from '@sidetree/ledger';
import QLDBLedger from '..';

jest.setTimeout(10 * 1000);

const ledger = new QLDBLedger('photon-test', 'Test');

beforeAll(async () => {
  await ledger.reset();
});

it('should initialize the ledger', async () => {
  await ledger.initialize();
  const tableNames = await ledger.qldbDriver.getTableNames();
  expect(tableNames.includes(ledger.transactionTable)).toBeTruthy();
});

testSuite(ledger);
