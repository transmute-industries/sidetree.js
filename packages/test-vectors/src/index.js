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

const testVectors = require('./dif-sidetree-test-vectors');
const filesystem = require('./filesystem');
const crypto = require('./crypto');
const sidetreeUniversalWallet = require('./sidetree-universal-wallet');
const sidetreeCoreGeneratedSecp256k1 = require('./core-generated-secp256k1');
const sidetreeCoreGeneratedEd25519 = require('./core-generated-ed25519');
const didMethodElement = require('./did-method-element');

const wallet = {
  mnemonic: require('./wallet/v1-mnemonic.json').mnemonic,
  keypair: require('./wallet/v1-keypair.json').keypair,
  secp256k1Operations: require('./wallet/v1-secp256k1-operations.json')
    .operations,
  ed25519Operations: require('./wallet/v1-ed25519-operations.json').operations,
};

const didMethod = {
  operations: require('./did-method/v1-did-method-secp256k1-operations.json'),
};

module.exports = {
  wallet,
  didMethod,

  //older  / stale

  testVectors,
  filesystem,
  crypto,
  sidetreeUniversalWallet,
  sidetreeCoreGeneratedSecp256k1,
  sidetreeCoreGeneratedEd25519,
  didMethodElement,
};
