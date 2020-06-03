import IOperationStore from '@sidetree/common/src/interfaces/IOperationStore';
import AnchoredOperationModel from '@sidetree/common/src/models/AnchoredOperationModel';
import { createConnection, MongoRepository, Connection } from 'typeorm';
import Operation from './entity/Operation';

export default class OperationStore implements IOperationStore {
  private connection: Connection | undefined;
  private repo: MongoRepository<Operation> | undefined;

  private readonly databaseName: string;

  constructor(private serverUrl: string, databaseName?: string) {
    this.databaseName = databaseName ? databaseName : 'sidetree';
  }

  public async initialize() {
    const connection = await createConnection({
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url: `${this.serverUrl}${this.databaseName}`,
      entities: ['src/entity/**/*.ts'],
    });
    this.connection = connection;
    this.repo = connection.getMongoRepository(Operation);
  }
  public async close() {
    return this.connection!.close();
  }

  public async put(operations: AnchoredOperationModel[]): Promise<void> {
    await this.repo!.insertMany(operations);
  }

  public async get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]> {
    const results = await this.repo!.find({ didUniqueSuffix });
    return results;
  }

  public async delete(transactionNumber?: number): Promise<void> {
    if (!transactionNumber) {
      await this.repo!.deleteMany({});
    }
  }

  public async deleteUpdatesEarlierThan(
    didUniqueSuffix: string,
    transactionNumber: number,
    operationIndex: number
  ): Promise<void> {
    console.log(didUniqueSuffix, transactionNumber, operationIndex);
  }
}
