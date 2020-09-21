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
