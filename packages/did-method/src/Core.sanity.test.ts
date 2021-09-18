import Core from './Core';

import { MockLedger } from '@sidetree/ledger';

it('can create intance of core', async () => {
    const config:any = {};
    const versionModels: any = [];
    const cas: any = {};
    const ledger: any = new MockLedger();
    const sidetreeNodeInstance = new Core(config, versionModels, cas, ledger);
    console.log(sidetreeNodeInstance)
});