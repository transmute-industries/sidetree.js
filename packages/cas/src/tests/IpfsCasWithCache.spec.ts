import { MongoDb } from '@sidetree/db';
import testSuite from './testSuite';
import IpfsCasWithCache from '../IpfsCasWithCache';
import config from './config.json';

const ipfsCasWithCache = new IpfsCasWithCache(
  config.contentAddressableStoreServiceUri,
  config.mongoDbConnectionString,
  config.databaseName
);

beforeAll(async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName
  );
});

testSuite(ipfsCasWithCache);
