/*
 * Copyright 2020 - Transmute Industries Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
