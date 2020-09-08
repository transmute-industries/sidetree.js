import { WalletContentWithMeta } from './WalletContentWithMeta';

export interface KeyPair extends WalletContentWithMeta {
  publicKeyBase58: string;
  privateKeyBase58: string;
}
