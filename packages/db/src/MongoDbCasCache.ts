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

import { FetchResult, FetchResultCode } from '@sidetree/common';
import MongoDbBase from './MongoDbBase';

export default class MongoDbCasCache extends MongoDbBase {
  readonly collectionName = 'cas-cache';

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.collection!.createIndex({ hash: 1 }, { unique: true });
  }

  async read(hash: string): Promise<FetchResult> {
    const operations = await this.collection!.find({ hash })
      .limit(1)
      .toArray();
    if (operations.length === 1) {
      const operation = operations.pop();
      return {
        code: FetchResultCode.Success,
        content: operation!.content.buffer as Buffer,
      };
    }
    return {
      code: FetchResultCode.NotFound,
    };
  }

  async write(hash: string, content: Buffer): Promise<void> {
    try {
      await this.collection!.insertOne({ hash, content });
    } catch (error) {
      // Duplicate insert errors (error code 11000).
      if (error.code !== 11000) {
        throw error;
      }
    }
  }
}
