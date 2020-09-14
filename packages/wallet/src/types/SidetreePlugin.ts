import { Wallet } from '@transmute/universal-wallet';

import { Mnemonic } from './Mnemonic';
import { KeyPair } from './KeyPair';
import { SidetreeCreateOperation } from './SidetreeCreateOperation';
import { SidetreeRecoverOperation } from './SidetreeRecoverOperation';
import { SidetreeReplaceOptions } from './SidetreeReplaceOptions';
import { DidDocument } from './DidDocument';

export interface SidetreePlugin {
  toMnemonic: (mnemonic?: string) => Promise<Mnemonic>;
  toKeyPair: (
    mnemonic: string,
    index: number,
    type?: string
  ) => Promise<KeyPair>;
  getCreateOperation: (
    mnemonic: string,
    index: number,
    options?: SidetreeReplaceOptions
  ) => Promise<SidetreeCreateOperation>;
  getRecoverOperation: (
    mnemonic: string,
    index: number,
    didUniqueSuffix: string,
    options?: SidetreeReplaceOptions
  ) => Promise<SidetreeRecoverOperation>;
  toDidDoc: (
    mnemonic: string,
    index: number,
    didMethodName: string
  ) => Promise<DidDocument>;
}

export interface SidetreeWallet extends Wallet, SidetreePlugin {}
