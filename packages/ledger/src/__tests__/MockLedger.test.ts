import MockLedger from '../MockLedger';
import testSuite from './testSuite';

const mock = new MockLedger();

testSuite(mock);
