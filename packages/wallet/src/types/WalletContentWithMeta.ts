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
