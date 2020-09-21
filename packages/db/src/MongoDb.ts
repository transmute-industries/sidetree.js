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
    collectionName: string,
    index?: string
  ): Promise<Collection<any>> {
    // Get the names of existing collections.
    const collections = await db.collections();
    const collectionNames = collections.map(
      collection => collection.collectionName
    );
    const collectionExists = collectionNames.find(c => c === collectionName);

    // If the collection exists, use it; else create it then use it.
    let collection;
    if (collectionExists) {
      console.info(`Reusing existing collection ${collectionName}`);
      collection = db.collection(collectionName);
    } else {
      console.info(`Creating new collection ${collectionName}`);
      collection = await db.createCollection(collectionName);
    }
    if (index) {
      await collection.createIndex({ [index]: 1 }, { unique: true });
    }

    return collection;
  }
}
