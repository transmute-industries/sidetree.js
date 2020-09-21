import testSuite from './testSuite';
import IpfsCas from '../IpfsCas';
import config from './config.json';

const mock = new IpfsCas(config.contentAddressableStoreServiceUri);

testSuite(mock);
