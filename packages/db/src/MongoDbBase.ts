import { Collection, MongoClient, Db } from 'mongodb';
import MongoDb from './MongoDb';

export default abstract class MongoDbBase {
  abstract collectionName: string;
  private serverUrl: string;
  private databaseName: string;
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
