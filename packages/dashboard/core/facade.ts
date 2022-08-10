import { dashboardWalletFactory } from './DashboardWallet';

export { dashboardWalletFactory as walletFactory };

export const getWallet = () => {
  const maybeWallet = localStorage.getItem('sidetree.wallet');
  if (maybeWallet) {
    return dashboardWalletFactory.build({ ...JSON.parse(maybeWallet) });
  }
  return null;
};
