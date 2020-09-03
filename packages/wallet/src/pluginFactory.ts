import * as Factory from 'factory.ts';

import {
  generateMnemonic,
  toUniversalWalletDataModel,
  getLinkedDataKeyPairsAtIndex,
  toInitialState,
  toSidetreeInitialContent,
  longFormDidToCreateOperation,
} from './methods';

import { SidetreePlugin } from './types';

const factoryDefaults = {
  generateMnemonic,
  toUniversalWalletDataModel,
  getLinkedDataKeyPairsAtIndex,
  toInitialState,
  toSidetreeInitialContent,
  longFormDidToCreateOperation,
};

const pluginFactory = Factory.Sync.makeFactory<SidetreePlugin>(factoryDefaults);

const plugin = pluginFactory.build();

export { SidetreePlugin, pluginFactory, factoryDefaults, plugin };
