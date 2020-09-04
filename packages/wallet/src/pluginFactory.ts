import * as Factory from 'factory.ts';

import { toMnemonic, toKeyPair } from './functions';

import { SidetreePlugin } from './types';

const factoryDefaults = {
  toMnemonic,
  toKeyPair,
};

const pluginFactory = Factory.Sync.makeFactory<SidetreePlugin>(factoryDefaults);

const plugin = pluginFactory.build();

export { SidetreePlugin, pluginFactory, factoryDefaults, plugin };
