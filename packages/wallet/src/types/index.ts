import { Wallet } from '@transmute/universal-wallet';

export interface WalletContent {
  id: string;
  type: string;
}

export interface SidetreePlugin {
  generateMnemonic: () => Promise<string>;
  toUniversalWalletDataModel: (
    type: string,
    mnemonic: string
  ) => Promise<WalletContent>;
  getLinkedDataKeyPairsAtIndex: (
    mnemonicContent: any,
    index: number
  ) => Promise<WalletContent[]>;
  toInitialState: (secp256k1KeyPair: any) => Promise<string>;
  toSidetreeInitialContent: (
    mnemonicContent: any,
    index: number,
    didMethod: string
  ) => Promise<any>;
  longFormDidToCreateOperation: (longFormDid: string) => any;
}

export interface SidetreeWallet extends Wallet, SidetreePlugin {}
