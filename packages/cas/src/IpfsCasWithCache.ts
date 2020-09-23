import {
  FetchResult,
  FetchResultCode,
  ServiceVersionModel,
} from '@sidetree/common';
import IpfsCas from './IpfsCas';
import { MongoDbCasCache } from '@sidetree/db';

export default class IpfsCasWithCache extends IpfsCas {
  private cache: MongoDbCasCache;

  constructor(casUrl: string, dbUrl: string, dbName: string) {
    super(casUrl);
    this.cache = new MongoDbCasCache(dbUrl, dbName);
  }

  public async initialize(): Promise<void> {
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
    const { version } = require('../package.json');
    return {
      name: 'ipfs-with-cache',
      version,
    };
  };
}
