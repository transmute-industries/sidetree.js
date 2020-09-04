import { Wallet } from '@transmute/universal-wallet';

export interface WalletContent {
  '@context': string | string[];
  id: string;
  type: string;
}

export interface WalletContentWithMeta extends WalletContent {
  name: string;
  description: string;
  image: string;
  tags: string[];
}

export interface Mnemonic extends WalletContentWithMeta {
  value: string;
}

export interface KeyPair extends WalletContentWithMeta {
  publicKeyBase58: string;
  privateKeyBase58: string;
}

export interface DidDocument extends WalletContentWithMeta {
  didDocument: any;
}

export interface SidetreePlugin {
  toMnemonic: (mnemonic?: string) => Promise<Mnemonic>;
  toKeyPair: (mnemonic: string, index: number) => Promise<KeyPair>;
}

export interface SidetreeWallet extends Wallet, SidetreePlugin {}
