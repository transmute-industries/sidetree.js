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

import { Collection, MongoClient, Db } from 'mongodb';

/**
 * MongoDB related operations.
 */
export default class MongoDb {
  /**
   * Test if a MongoDB service is running at the specified url.
   */
  public static async isServerAvailable(serverUrl: string): Promise<boolean> {
    try {
      const client = await MongoClient.connect(serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
      await client.close();
    } catch (error) {
      console.log('Mongoclient connect error: ' + error);
      return false;
    }
    return true;
  }

  public static async resetDatabase(
    serverUrl: string,
    databaseName: string
  ): Promise<boolean> {
    try {
      const client = await MongoClient.connect(serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
      const db = await client.db(databaseName);
      const res = await db.dropDatabase();
      await client.close();
      return res;
    } catch (error) {
      console.log('Mongoclient connect error: ' + error);
      return false;
    }
  }

  public static async createCollectionIfNotExist(
    db: Db,
    collectionName: string
  ): Promise<Collection<any>> {
    // Get the names of existing collections.
    const collections = await db.collections();
    const collectionNames = collections.map(
      (collection) => collection.collectionName
    );
    const collectionExists = collectionNames.find((c) => c === collectionName);

    // If the collection exists, use it; else create it then use it.
    let collection;
    if (collectionExists) {
      console.info(`Reusing existing collection ${collectionName}`);
      collection = db.collection(collectionName);
    } else {
      console.info(`Creating new collection ${collectionName}`);
      collection = await db.createCollection(collectionName);
    }
    return collection;
  }
}
