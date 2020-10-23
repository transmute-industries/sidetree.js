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

import {
  toMnemonic,
  toKeyPair,
  // svip interop profile
  toDidDocForProfile,
  getCreateOperationForProfile,
  getRecoverOperationForProfile,
} from './functions';

import { SidetreePlugin } from './types';

const factoryDefaults = {
  toMnemonic,
  toKeyPair,
  // svip interop profile
  toDidDocForProfile,
  getCreateOperationForProfile,
  getRecoverOperationForProfile,
};

const pluginFactory = Factory.Sync.makeFactory<SidetreePlugin>(factoryDefaults);

const plugin = pluginFactory.build();

export { SidetreePlugin, pluginFactory, factoryDefaults, plugin };
