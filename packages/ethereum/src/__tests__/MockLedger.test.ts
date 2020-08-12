import { MockLedger } from '@sidetree/ledger';
import testSuite from './testSuite';

const mock = new MockLedger();

testSuite(mock);
