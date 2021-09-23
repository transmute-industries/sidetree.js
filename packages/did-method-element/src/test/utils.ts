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
import { MongoClient } from 'mongodb';

import Web3 from 'web3';
import { EthereumLedger } from '@sidetree/ethereum';
// import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { MockCas } from '@sidetree/cas';
import Element from '../Element';

const config: any = require('./element-ganache-config.json');

const writeFixture = (filename: string, object: any) => {
  fs.writeFileSync(
    path.resolve(__dirname, '../__fixtures__/', filename),
    JSON.stringify(object, null, 2)
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
  const ledger = await getTestLedger();
  const cas = await getTestCas();
  const element = new Element(config, config.versions, cas, ledger);
  await element.initialize();
  return element;
};

const clearCollection = async (collectionName: string) => {
  const client = await MongoClient.connect(config.mongoDbConnectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = await client.db(config.databaseName);
  const collection = db.collection(collectionName);
  //   const documents = await collection.find({}).toArray();
  await collection.deleteMany({});
  await client.close();
};

export {
  getTestLedger,
  getTestCas,
  getTestElement,
  writeFixture,
  clearCollection,
};
