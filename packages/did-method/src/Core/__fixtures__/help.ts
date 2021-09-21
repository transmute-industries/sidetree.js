
import Core from '../Core';

import { ConsoleLogger }  from '@sidetree/common';

import { MockCas } from '@sidetree/cas';

import { MockLedger } from '@sidetree/ledger';

import sidetreeTestNodeCoreConfig from './sidetree-test-node-config.json';
import sidetreeTestNodeCoreVersions from './sidetree-test-node-core-versions.json';

export { sidetreeTestNodeCoreConfig, sidetreeTestNodeCoreVersions };

export const waitSeconds = async (seconds: number) => {
    return new Promise((resolve)=> {
        setTimeout(resolve, seconds * 1000);
    });
  
}

export const getTestSidetreeNodeInstance = async () => {
    const cas: any = new MockCas();
    const ledger: any = new MockLedger();
    const sidetreeNodeInstance = new Core(
        sidetreeTestNodeCoreConfig as any, 
        sidetreeTestNodeCoreVersions as any, 
        cas, 
        ledger
    );
    await sidetreeNodeInstance.initialize(new ConsoleLogger())
    return sidetreeNodeInstance;
}