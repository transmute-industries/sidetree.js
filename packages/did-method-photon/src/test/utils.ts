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

import { getNodeInstance } from '..';
import config from './photon-config.json';
const { MongoClient } = require('mongodb');

let client: any;

export const clearCollection = async (collectionName: string) => {
  client = await MongoClient.connect(config.mongoDbConnectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  } as any);
  const db = await client.db(config.databaseName);
  const collection = db.collection(collectionName);
  await collection.deleteMany({});
  await client.close();
};

export const getTestPhoton = async (): Promise<any> => {
  const photon = await getNodeInstance(config);
  return photon;
};

export const replaceMethod = (
  result: JSON,
  defaultMethod = 'did:elem',
  specificMethod = 'did:photon'
): JSON => {
  const stringified = JSON.stringify(result);
  const updatedStringified = stringified.replace(
    new RegExp(defaultMethod, 'g'),
    specificMethod
  );
  const updateResult = JSON.parse(updatedStringified);
  return updateResult;
};
