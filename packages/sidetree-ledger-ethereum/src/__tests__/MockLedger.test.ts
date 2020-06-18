import MockBlockchain from '../MockLedger';
import testSuite from './testSuite';

const mock = new MockBlockchain();

testSuite(mock);
