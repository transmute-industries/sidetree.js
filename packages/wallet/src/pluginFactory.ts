/*
 * Copyright 2020 - Transmute Industries Inc.
 *
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

import * as Factory from 'factory.ts';

import { Mnemonic, KeyPair } from './types';

import {
  toMnemonic,
  toKeyPair,
  createLongFormDid,
  computeDidUniqueSuffix,
  LocalSigner,
  operations,
} from './operations';

import { SidetreeDocumentModel, Jwk } from './operations/types';

interface SidetreePlugin {
  toMnemonic: (mnemonic?: string) => Promise<Mnemonic>;
  toKeyPair: (
    mnemonic: string,
    index: number,
    type: string,
    hdPath?: string
  ) => Promise<KeyPair>;
  operations: any;
  createLongFormDid: (input: {
    method: string;
    network: string;
    document: SidetreeDocumentModel;
    updateKey: Jwk;
    recoveryKey: Jwk;
  }) => string;
  computeDidUniqueSuffix: any;
  LocalSigner: any;
}

const factoryDefaults = {
  toMnemonic,
  toKeyPair,
  operations,

  createLongFormDid,
  computeDidUniqueSuffix,
  LocalSigner,
};

const SidetreeWalletPlugin = Factory.Sync.makeFactory<SidetreePlugin>(
  factoryDefaults
);

export { SidetreePlugin, factoryDefaults, SidetreeWalletPlugin };
