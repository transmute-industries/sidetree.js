import * as Factory from 'factory.ts';
import * as UniversalWallet from '@transmute/universal-wallet';
import * as SidetreeWallet from '@sidetree/wallet';

export interface DashboardWallet
  extends UniversalWallet.Wallet,
    SidetreeWallet.SidetreePlugin {}

export const dashboardWalletFactory: Factory.Sync.Factory<DashboardWallet> = Factory.Sync.makeFactory<
  DashboardWallet
>({} as any)
  .combine(SidetreeWallet.SidetreeWalletPlugin)
  .combine(UniversalWallet.walletFactory);
