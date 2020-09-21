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
  // vanilla secp256k1
  toDidDoc: (
    mnemonic: string,
    index: number,
    didMethodName: string
  ) => Promise<DidDocument>;
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

  // svip interop profile
  toDidDocForProfile: (
    mnemonic: string,
    index: number,
    didMethodName: string,
    profile: string,
    options?: SidetreeReplaceOptions
  ) => Promise<DidDocument>;
  getCreateOperationForProfile: (
    mnemonic: string,
    index: number,
    profile: string,
    options?: SidetreeReplaceOptions
  ) => Promise<SidetreeCreateOperation>;
  getRecoverOperationForProfile: (
    mnemonic: string,
    index: number,
    didUniqueSuffix: string,
    profile: string,
    options?: SidetreeReplaceOptions
  ) => Promise<SidetreeRecoverOperation>;
}

export interface SidetreeWallet extends Wallet, SidetreePlugin {}
