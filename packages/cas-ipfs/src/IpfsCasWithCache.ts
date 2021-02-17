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

import {
  FetchResult,
  FetchResultCode,
  ServiceVersionModel,
} from '@sidetree/common';
import IpfsCas from './IpfsCas';
import { MongoDbCasCache } from '@sidetree/db';
const { version } = require('../package.json');

export default class IpfsCasWithCache extends IpfsCas {
  private cache: MongoDbCasCache;

  constructor(casUrl: string, dbUrl: string, dbName: string) {
    super(casUrl);
    this.cache = new MongoDbCasCache(dbUrl, dbName);
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.cache.initialize();
  }

  public async close(): Promise<void> {
    await this.cache.close();
  }

  public async write(content: Buffer): Promise<string> {
    const hash = await super.write(content);
    await this.cache.write(hash, content);
    return hash;
  }

  public async read(address: string): Promise<FetchResult> {
    const cachedResult = await this.cache.read(address);
    if (cachedResult.code === FetchResultCode.Success) {
      console.info(`Returning cached content for address ${address}`);
      return cachedResult;
    }
    const result = await super.read(address);
    if (result.code === FetchResultCode.Success) {
      console.info(`Caching read result for ${address}`);
      await this.cache.write(address, result.content!);
    }
    return result;
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'ipfs-with-cache',
      version,
    };
  };
}
