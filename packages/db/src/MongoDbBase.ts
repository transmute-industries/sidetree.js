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
import MongoDb from './MongoDb';

export default abstract class MongoDbBase {
  abstract collectionName: string;
  private serverUrl: string;
  public databaseName: string;
  private client: MongoClient | undefined;
  protected db: Db | undefined;
  protected collection: Collection<any> | undefined;

  constructor(serverUrl: string, databaseName: string) {
    this.serverUrl = serverUrl;
    this.databaseName = databaseName;
  }

  public async close(): Promise<void> {
    return this.client!.close();
  }

  public async clearCollection(): Promise<void> {
    await this.collection!.deleteMany({});
  }

  public async initialize(): Promise<void> {
    this.client =
      this.client ||
      (await MongoClient.connect(this.serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })); // `useNewUrlParser` addresses nodejs's URL parser deprecation warning.
    this.db = this.client.db(this.databaseName);
    this.collection = await MongoDb.createCollectionIfNotExist(
      this.db!,
      this.collectionName
    );
  }
}
