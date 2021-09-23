import Core from '../Core';
import { MongoClient } from 'mongodb';

import { ConsoleLogger } from '@sidetree/common';

import { MockCas } from '@sidetree/cas';

import { MockLedger } from '@sidetree/ledger';

import sidetreeTestNodeCoreConfig from './sidetree-test-node-config.json';
import sidetreeTestNodeCoreVersions from './sidetree-test-node-core-versions.json';

export { sidetreeTestNodeCoreConfig, sidetreeTestNodeCoreVersions };

export const waitSeconds = async (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const getTestSidetreeNodeInstance = async () => {
  const cas: any = new MockCas();
  const ledger: any = new MockLedger();
  const sidetreeNodeInstance = new Core(
    sidetreeTestNodeCoreConfig as any,
    sidetreeTestNodeCoreVersions as any,
    cas,
    ledger
  );
  await sidetreeNodeInstance.initialize(new ConsoleLogger());
  return sidetreeNodeInstance;
};

export const clearCollection = async (collectionName: string) => {
  const client: any = await MongoClient.connect(
    sidetreeTestNodeCoreConfig.mongoDbConnectionString,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as any
  );
  const db = await client.db(sidetreeTestNodeCoreConfig.databaseName);
  const collection = db.collection(collectionName);
  //   const documents = await collection.find({}).toArray();
  await collection.deleteMany({});
  await client.close();
};
