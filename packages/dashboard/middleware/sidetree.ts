import type { NextApiRequest } from 'next';
import { getTestNodeIntance as testMethod } from '@sidetree/did-method';
import { getNodeInstance as element } from '@sidetree/element';
import { getNodeInstance as photon } from '@sidetree/photon';

export * from './convertSidetreeStatusToHttpStatus';

const methods: any = {
  'example:sidetree.testnet': testMethod,
  // causes Module not found: Can't resolve 'electron'
  // related to
  // https://ethereum.stackexchange.com/questions/111540/cant-resolve-electron-in-opt-build-repo-node-modules-swarm-js-node-modules
  'elem:ganache': element,
  'elem:ropsten': element,
  photon,
};

export interface SidetreeApiRequest extends NextApiRequest {
  client: {
    server: {
      service: {
        sidetree: any;
      };
    };
  };
}

export const methodSwitch = (method: string) => {
  if (methods[method]) {
    return methods[method];
  }
  throw new Error('Unsupported method: ' + method);
};
