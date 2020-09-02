import * as bip39 from 'bip39';

export const generateMnemonic = async () => {
  const mnemonic = await bip39.generateMnemonic();
  return mnemonic;
};
