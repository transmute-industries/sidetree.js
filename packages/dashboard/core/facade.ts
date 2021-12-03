// import * as common from '@sidetree/common';
// import * as crypto from '@sidetree/crypto';
// import * as wallet from '@sidetree/wallet';

// const checkModulesWork = () => {
//   // console.log({ common });
//   // console.log({ crypto });
//   // console.log({ wallet });
// };

import { dashboardWalletFactory } from './DashboardWallet';

export const getWallet = () => {
  const maybeWallet = localStorage.getItem('sidetree.wallet');
  if (maybeWallet) {
    return dashboardWalletFactory.build({ ...JSON.parse(maybeWallet) });
  }
  return null;
};

export const createWallet = async () => {
  // checkModulesWork();
  const w = dashboardWalletFactory.build();
  const m = await w.toMnemonic();
  w.add(m);
  console.log('created wallet.');
  localStorage.setItem('sidetree.wallet', JSON.stringify(w, null, 2));
  window.location.href = '/create';
};
