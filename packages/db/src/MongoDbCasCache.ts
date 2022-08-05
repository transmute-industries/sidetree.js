/* eslint-disable prettier/prettier */
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
import { MongoClient, Collection, Db } from 'mongodb';

export default class MongoDbCasCache {
  public static readonly collectionName: string = 'cas-cache';

  private collection: Collection<any> | undefined;
  private client?: MongoClient;
  private db: Db | undefined;

  private static async createCollectionIfNotExist(
    db: Db
  ): Promise<Collection<any>> {
    // Get the names of existing collections.
    const collections = await db.collections();
    const collectionNames = collections.map(
      (collection) => collection.collectionName
    );

    // If the queued operation collection exists, use it; else create it then use it.
    let collection;
    if (collectionNames.includes(MongoDbCasCache.collectionName)) {
      collection = db.collection(MongoDbCasCache.collectionName);
    } else {
      collection = await db.createCollection(MongoDbCasCache.collectionName);
    }

    return collection;
  }

  public async initialize(
    serverUrl: string,
    databaseName: string
  ): Promise<void> {
    const client = await MongoClient.connect(serverUrl);
    this.client = client;
    this.db = client.db(databaseName);
    this.collection = await MongoDbCasCache.createCollectionIfNotExist(this.db);
  }

  public async stop(): Promise<void> {
    return this.client!.close();
  }

  async read(hash: string): Promise<FetchResult> {
    const operations = await this.collection!.find({ hash }).limit(1).toArray();
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
      if ((error as any).code !== 11000) {
        throw error;
      }
    }
  }
}
