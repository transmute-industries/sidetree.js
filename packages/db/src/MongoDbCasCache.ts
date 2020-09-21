import { FetchResult, FetchResultCode } from '@sidetree/common';
import { Collection, MongoClient, Db, Binary } from 'mongodb';
import { MongoDb } from '.';

type CasCacheRecord = {
  hash: string;
  content: Binary;
};

/**
 * Operation queue used by the Batch Writer implemented using MongoDB.
 */
export default class MongoDbCasCache {
  /** Collection name for queued operations. */
  public readonly collectionName: string = 'cas-cache';

  private collection: Collection<CasCacheRecord> | undefined;
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

  public async initialize(): Promise<void> {
    this.client =
      this.client ||
      (await MongoClient.connect(this.serverUrl, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })); // `useNewUrlParser` addresses nodejs's URL parser deprecation warning.
    this.db = this.client.db(this.databaseName);
    this.collection = await MongoDb.createCollectionIfNotExist(
      this.db,
      this.collectionName,
      'hash'
    );
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

  async write(hash: string, content: Binary): Promise<void> {
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
