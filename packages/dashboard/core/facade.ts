import { dashboardWalletFactory } from './DashboardWallet';

export const getWallet = () => {
  const maybeWallet = localStorage.getItem('sidetree.wallet');
  if (maybeWallet) {
    return dashboardWalletFactory.build({ ...JSON.parse(maybeWallet) });
  }
  return null;
};

export const createWallet = async ({ mnemonic, hdpath }: any) => {
  const w = dashboardWalletFactory.build();
  console.log(mnemonic, hdpath);
  if (mnemonic && hdpath) {
    const m: any = await w.toMnemonic(mnemonic);
    m.hdpath = hdpath;
    w.add(m);
  } else {
    const m = await w.toMnemonic();
    w.add(m);
  }
  console.log('created wallet.');
  localStorage.setItem('sidetree.wallet', JSON.stringify(w, null, 2));
  window.location.href = '/create';
};
