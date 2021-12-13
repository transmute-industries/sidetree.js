import { MongoDbCasCache } from '..';

console.log(MongoDbCasCache);

const cache = new MongoDbCasCache();

describe('MongoDbCasCache', () => {
  it('should initilialize the database', async () => {
    const serverUrl = 'mongodb://localhost:27017/';
    const databaseName = 'sidetree-test';
    await cache.initialize(serverUrl, databaseName);
    expect(1).toBe(1);
  });
});

afterAll(async () => {
  await cache.stop();
});
