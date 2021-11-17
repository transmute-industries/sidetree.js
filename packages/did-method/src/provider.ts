import { MockCas } from '@sidetree/cas';

import { MockLedger } from '@sidetree/ledger';

import sidetreeTestNodeCoreConfig from './configs/sidetree-test-node-config.json';
import sidetreeTestNodeCoreVersions from './configs/sidetree-test-node-core-versions.json';
import Core from './Core';
import { ConsoleLogger } from '@sidetree/common';

export const getTestNodeIntance = async () => {
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
