import { MockCas } from '@evan.network/sidetree-cas';

import { MockLedger } from '@evan.network/sidetree-ledger';

import sidetreeTestNodeCoreVersions from './configs/sidetree-test-node-core-versions.json';
import Core from './Core';
import { ConsoleLogger } from '@evan.network/sidetree-common';

export const getTestNodeIntance = async (sideTreeNodeCoreConfig: {
  batchingIntervalInSeconds: number;
  observingIntervalInSeconds: number;
  mongoDbConnectionString: string;
  databaseName: string;
  didMethodName: string;
  maxConcurrentDownloads: number;
  port: number;
}) => {
  const cas: any = new MockCas();
  await cas.initialize();
  const ledger: any = new MockLedger();
  const sidetreeNodeInstance = new Core(
    sideTreeNodeCoreConfig as any,
    sidetreeTestNodeCoreVersions as any,
    cas,
    ledger
  );
  await sidetreeNodeInstance.initialize(new ConsoleLogger());
  return sidetreeNodeInstance;
};
