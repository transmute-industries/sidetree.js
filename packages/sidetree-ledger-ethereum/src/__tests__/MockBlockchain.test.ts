import MockBlockchain from '../MockBlockchain';
import testSuite from './testSuite';

const mock = new MockBlockchain();

testSuite(mock);
