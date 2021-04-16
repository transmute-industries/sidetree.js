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

import fs from 'fs';
import path from 'path';

import { MongoDb } from '@sidetree/db';
import Web3 from 'web3';
import { EthereumLedger } from '@sidetree/ethereum';
// import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { MockCas } from '@sidetree/cas';
import Element from '../Element';

const config: any = require('./element-config.json');

const writeFixture = (filename: string, object: any) => {
  fs.writeFileSync(
    path.resolve(__dirname, '../__fixtures__/', filename),
    JSON.stringify(object, null, 2)
  );
};

const resetDatabase = async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const getTestLedger = async () => {
  const web3 = new Web3(config.ethereumRpcUrl);
  const ledger = new EthereumLedger(web3, config.elementAnchorContract);
  return ledger;
};

const getTestCas = async () => {
  // FIXME: IPFS has intermittent failures in tests so we will use MockCas until it's fixed
  // See: https://github.com/transmute-industries/sidetree.js/runs/2178633982#step:8:178
  // const cas = new IpfsCasWithCache(
  //   config.contentAddressableStoreServiceUri,
  //   config.mongoDbConnectionString,
  //   config.databaseName
  // );
  const cas = new MockCas();
  return cas;
};

const getTestElement = async () => {
  await resetDatabase();
  const ledger = await getTestLedger();
  const cas = await getTestCas();

  const element = new Element(config, config.versions, ledger, cas);
  await element.initialize(false, false);
  return element;
};

const replaceMethod = (
  result: any,
  defaultMethod = 'sidetree',
  specificMethod = 'elem'
) => {
  // prevent mutation
  const _result = JSON.parse(JSON.stringify(result));
  _result.didDocument.id = _result.didDocument.id.replace(
    specificMethod,
    defaultMethod
  );
  // upstream sidetree sets controller incorrectly.
  _result.didDocument.publicKey[0].controller = '';
  if (_result.didDocument.publicKey[1]) {
    _result.didDocument.publicKey[1].controller = '';
  }
  _result.didDocument['@context'][2]['@base'] = _result.didDocument[
    '@context'
  ][2]['@base'].replace(specificMethod, defaultMethod);
  return _result;
};

export {
  resetDatabase,
  getTestLedger,
  getTestCas,
  getTestElement,
  replaceMethod,
  writeFixture,
};
