/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/master/reference-implementation-changes.md
 *
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

import { MongoDb } from '@sidetree/db';
import testSuite from './testSuite';
import IpfsCasWithCache from '../IpfsCasWithCache';
import config from './config.json';

const ipfsCasWithCache = new IpfsCasWithCache(
  config.contentAddressableStoreServiceUri,
  config.mongoDbConnectionString,
  config.databaseName
);

beforeAll(async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName
  );
});

testSuite(ipfsCasWithCache);