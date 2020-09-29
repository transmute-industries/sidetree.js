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

const walletResolution = require('./wallet-resolution.json');

const sidetreeCoreGeneratedSecp256k1Resolutions = require('./sidetree-core-generated-secp256k1-resolution.json');

const sidetreeCoreGeneratedEd25519Resolutions = require('./sidetree-core-generated-ed25519-resolution.json');
const walletSvipResolutions = require('./wallet-svip-resolution.json');

export {
  walletResolution,
  sidetreeCoreGeneratedSecp256k1Resolutions,
  sidetreeCoreGeneratedEd25519Resolutions,
  walletSvipResolutions,
};
