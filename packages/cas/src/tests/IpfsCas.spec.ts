import testSuite from './testSuite';
import IpfsCas from '../IpfsCas';
import config from './config.json';

const cas = new IpfsCas(config.contentAddressableStoreServiceUri);

testSuite(cas);
