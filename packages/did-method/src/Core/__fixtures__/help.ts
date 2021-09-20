
import Core from '../Core';

import { ConsoleLogger }  from '@sidetree/common';

import { MockLedger } from '@sidetree/ledger';

import testNodeConfig from './sidetree-test-node-config.json';

export { testNodeConfig };

export const waitSeconds = async (seconds: number) => {
    return new Promise((resolve)=> {
        setTimeout(resolve, seconds * 1000);
    });
  
}

export const getTestSidetreeNodeInstance = async (config: any = testNodeConfig, initialize = true) => {
    const versionModels: any = [];
    const cas: any = {};
    const ledger: any = new MockLedger();
    const sidetreeNodeInstance = new Core(config, versionModels, cas, ledger);
    if (initialize){
        await sidetreeNodeInstance.initialize(new ConsoleLogger())
    }
    return sidetreeNodeInstance;
}