/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
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

import config from './config-test.json';
import MongoDbCasCache from '../MongoDbCasCache';
import { FetchResultCode } from '@sidetree/common';
import { MongoDb } from '..';

describe('MongoDbCasCache', () => {
  let cache: MongoDbCasCache;

  beforeAll(async () => {
    await MongoDb.resetDatabase(
      config.mongoDbConnectionString,
      config.databaseName
    );
    cache = new MongoDbCasCache(
      config.mongoDbConnectionString,
      config.databaseName
    );
    await cache.initialize();
    await cache.clearCollection();
  });

  afterAll(async () => {
    await cache.close();
  });

  it('should be defined', () => {
    expect(cache).toBeDefined();
    expect(cache.collectionName).toBe('cas-cache');
  });

  it('should write content', async () => {
    await cache.write('hash', Buffer.from('123'));
  });

  it('should write duplicate content without error', async () => {
    await cache.write('hash', Buffer.from('123'));
  });

  it('should read content from hash', async () => {
    const result = await cache.read('hash');
    expect(result.code).toBe(FetchResultCode.Success);
    expect(result.content).toEqual(Buffer.from('123'));
  });

  it('should handle not found', async () => {
    const result = await cache.read('not-found-hash');
    expect(result.code).toBe(FetchResultCode.NotFound);
  });
});
