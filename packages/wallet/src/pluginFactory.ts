import * as Factory from 'factory.ts';

import {
  toMnemonic,
  toKeyPair,
  // vanilla secp256k1
  toDidDoc,
  getCreateOperation,
  getRecoverOperation,

  // svip interop profile
  toDidDocForProfile,
  getCreateOperationForProfile,
  getRecoverOperationForProfile,
} from './functions';

import { SidetreePlugin } from './types';

const factoryDefaults = {
  toMnemonic,
  toKeyPair,
  // vanilla secp256k1
  toDidDoc,
  getCreateOperation,
  getRecoverOperation,
  // svip interop profile
  toDidDocForProfile,
  getCreateOperationForProfile,
  getRecoverOperationForProfile,
};

const pluginFactory = Factory.Sync.makeFactory<SidetreePlugin>(factoryDefaults);

const plugin = pluginFactory.build();

export { SidetreePlugin, pluginFactory, factoryDefaults, plugin };
