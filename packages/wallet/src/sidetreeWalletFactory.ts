import * as Factory from 'factory.ts';

import { walletDefaults, walletFactory } from '@transmute/universal-wallet';

import * as Sidetree from './pluginFactory';

import { SidetreeWallet } from './types';

const sidetreeWalletDefaults = {
  ...walletDefaults,
  ...Sidetree.factoryDefaults,
};

const sidetreeWalletFactory = Factory.Sync.makeFactory<SidetreeWallet>(
  sidetreeWalletDefaults
)
  .combine(walletFactory)
  .combine(Sidetree.pluginFactory);

const wallet = sidetreeWalletFactory.build();

export {
  SidetreeWallet,
  sidetreeWalletDefaults,
  sidetreeWalletFactory,
  wallet,
};
