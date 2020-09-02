import { Wallet } from '@transmute/universal-wallet';

export interface WalletContent {
  '@context': string | string[];
  id: string;
  type: string;
}

export interface WalletContentMeta {
  name: string;
  description: string;
  image: string;
  tags: string[];
}

export interface WalletContentWithMeta
  extends WalletContent,
    WalletContentMeta {}

export interface SidetreePlugin {
  generateMnemonic: () => Promise<string>;
  toUniversalWalletDataModel: (
    type: string,
    mnemonic: string
  ) => Promise<WalletContent>;
  getLinkedDataKeyPairsAtIndex: (
    mnemonic: string,
    index: number
  ) => Promise<WalletContent[]>;
  toInitialState: (secp256k1KeyPair: LinkedDataKeyPair) => Promise<string>;
  toSidetreeInitialContent: (
    mnemonic: string,
    index: number,
    didMethod: string
  ) => Promise<WalletContent[]>;
  longFormDidToCreateOperation: (
    longFormDid: string
  ) => SidetreeCreateOperation;
}

export interface SidetreeWallet extends Wallet, SidetreePlugin {}

export interface JWK {
  kty: string;
  crv: string;
  x: string;
  y: string;
  d?: string;
  kid?: string;
}

export interface LinkedDataKeyPair {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58: string;
  privateKeyBase58: string;
  toJwk: () => JWK;
  fingerprint: () => string;
}

export interface SidetreeCreateOperation {
  type: 'create';
  suffix_data: string;
  delta: string;
}

export interface WalletContentKeyPair
  extends WalletContent,
    WalletContentMeta,
    LinkedDataKeyPair {}

export interface WalletContentMnemonic
  extends WalletContent,
    WalletContentMeta {
  value: string;
}

export interface WalletContentDidDocument extends WalletContentWithMeta {
  didDocument: any;
}

export type usableWalletContent = any;
