import config from './config-test.json';
import MongoDbCasCache from '../MongoDbCasCache';
import { FetchResultCode } from '@sidetree/common';

describe('MongoDbCasCache', () => {
  let cache: MongoDbCasCache;

  beforeAll(async () => {
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
