import { FetchResult, FetchResultCode } from '@sidetree/common';
import { Collection, MongoClient, Db } from 'mongodb';

/**
 * Operation queue used by the Batch Writer implemented using MongoDB.
 */
export default class MongoDbCasCache {
  /** Collection name for queued operations. */
  public readonly collectionName: string = 'cas-cache';

  private collection: Collection<any> | undefined;
  private serverUrl: string;
  private databaseName: string;
  private db: Db | undefined;

  constructor(serverUrl: string, databaseName: string) {
    this.serverUrl = serverUrl;
    this.databaseName = databaseName;
  }

  private client: MongoClient | undefined;

  public async close(): Promise<void> {
    return this.client!.close();
  }

  public async clearCollection(): Promise<void> {
    await this.collection!.deleteMany({});
  }

  private async createCollectionIfNotExist(): Promise<Collection<any>> {
    if (this.db) {
      // Get the names of existing collections.
      const collections = await this.db.collections();
      const collectionNames = collections.map(
        collection => collection.collectionName
      );

      // If the collection exists, use it; else create it then use it.
      let collection;
      if (collectionNames.includes(this.collectionName)) {
        collection = this.db.collection(this.collectionName);
      } else {
        collection = await this.db.createCollection(this.collectionName);
      }
      await collection.createIndex({ hash: 1 }, { unique: true });

      return collection;
    } else {
      throw new Error('db must be defined in order to create collection');
    }
  }

  public async initialize(): Promise<void> {
    this.client =
      this.client ||
      (await MongoClient.connect(this.serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })); // `useNewUrlParser` addresses nodejs's URL parser deprecation warning.
    this.db = this.client.db(this.databaseName);
    this.collection = await this.createCollectionIfNotExist();
  }

  async read(hash: string): Promise<FetchResult> {
    const operations = await this.collection!.find({ hash })
      .limit(1)
      .toArray();
    if (operations.length === 1) {
      const operation = operations.pop();
      return {
        code: FetchResultCode.Success,
        content: operation.content.buffer,
      };
    }
    return {
      code: FetchResultCode.NotFound,
    };
  }

  async write(hash: string, content: Buffer): Promise<string> {
    try {
      await this.collection!.insertOne({ hash, content });
    } catch (error) {
      // Duplicate insert errors (error code 11000).
      if (error.code !== 11000) {
        throw error;
      }
    }
    return '';
  }
}
