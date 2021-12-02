import type { NextApiRequest, NextApiResponse } from 'next';

import { getTestNodeIntance as testMethod } from '@sidetree/did-method';
import { getTestNodeIntance as testElement } from '@sidetree/element';

export * from './convertSidetreeStatusToHttpStatus';

const methods: any = {
  'example:sidetree.testnet': testMethod,
  // causes Module not found: Can't resolve 'electron'
  // related to
  // https://ethereum.stackexchange.com/questions/111540/cant-resolve-electron-in-opt-build-repo-node-modules-swarm-js-node-modules
  'elem:ganache': testElement,
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

export const sidetree = (handler: any) => async (
  req: SidetreeApiRequest,
  res: NextApiResponse
) => {
  const methodName: string =
    process.env.SIDETREE_METHOD || 'example:sidetree.testnet';

  // todo: load other config values and pass them to the provider
  const method = await methodSwitch(methodName)();
  const version = await method.handleGetVersionRequest();
  req.sidetree = { version: JSON.parse(version.body), method };
  return handler(req, res);
};
