import testSuite from './testSuite';
import IpfsCas from '../IpfsCas';
import { multiaddr } from '../__fixtures__';

const mock = new IpfsCas(multiaddr);

testSuite(mock);
