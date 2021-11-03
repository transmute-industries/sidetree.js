import * as Factory from 'factory.ts';
import * as UniversalWallet from '@transmute/universal-wallet';
import * as SidetreeWallet from '@sidetree/wallet';

console.log(SidetreeWallet);

export interface DashboardWallet
  extends UniversalWallet.Wallet,
    SidetreeWallet.pluginFactory.SidetreePlugin {}

export const dashboardWalletFactory: Factory.Sync.Factory<DashboardWallet> = Factory.Sync.makeFactory<
  DashboardWallet
>({} as any)
  .combine(SidetreeWallet.pluginFactory.pluginFactory)
  .combine(UniversalWallet.walletFactory);
