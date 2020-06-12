import testSuite from './testSuite';
import IpfsCas from '../IpfsCas';

const mock = new IpfsCas('/ip4/127.0.0.1/tcp/5001');

testSuite(mock);
