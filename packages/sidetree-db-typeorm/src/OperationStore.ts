import IOperationStore from '@sidetree/common/src/interfaces/IOperationStore';
import AnchoredOperationModel from '@sidetree/common/src/models/AnchoredOperationModel';
import OperationType from '@sidetree/common/src/enums/OperationType';
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
      // Typeorm does not allow two connections to have the same name
      // So we use a different name everytime in order to have parallel connections
      name: `${Date.now()}`,
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url: `${this.serverUrl}${this.databaseName}`,
      entities: [Operation],
    });
    this.connection = connection;
    this.repo = connection.getMongoRepository(Operation);
  }
  public async close() {
    return this.connection!.close();
  }

  public async put(operations: AnchoredOperationModel[]): Promise<void> {
    // Remove duplicates (same operationIndex) from the operations array
    const operationsWithoutDuplicates = operations.reduce(
      (opsWithoutDuplicates: AnchoredOperationModel[], operation) => {
        const exists = opsWithoutDuplicates.find(
          op => op.operationIndex === operation.operationIndex
        );
        if (Boolean(exists)) {
          return opsWithoutDuplicates;
        } else {
          return [...opsWithoutDuplicates, operation];
        }
      },
      []
    );
    // Only insert new elements
    const onlyNewElements: AnchoredOperationModel[] = [];
    for (const operation of operationsWithoutDuplicates) {
      const anchoredOperation: AnchoredOperationModel = operation;
      const res = await this.get(anchoredOperation.didUniqueSuffix);
      const isDuplicated = res.find(
        op => op.operationIndex === anchoredOperation.operationIndex
      );
      if (!Boolean(isDuplicated)) {
        onlyNewElements.push(anchoredOperation);
      }
    }
    if (onlyNewElements.length > 0) {
      await this.repo!.insertMany(onlyNewElements);
    }
  }

  public async get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]> {
    const results = await this.repo!.find({ didUniqueSuffix });
    // Ensure operations are sorted by increasing order of operationIndex
    results.sort((op1, op2) => op1.operationIndex - op2.operationIndex);
    return results;
  }

  public async delete(transactionNumber?: number): Promise<void> {
    if (transactionNumber) {
      await this.repo!.deleteMany({
        transactionNumber: { $gt: transactionNumber },
      });
    } else {
      await this.repo!.deleteMany({});
    }
  }

  public async deleteUpdatesEarlierThan(
    didUniqueSuffix: string,
    transactionNumber: number,
    operationIndex: number
  ): Promise<void> {
    await this.repo!.deleteMany({
      $or: [
        {
          didUniqueSuffix,
          transactionNumber: { $lt: transactionNumber },
          type: OperationType.Update,
        },
        {
          didUniqueSuffix,
          transactionNumber,
          operationIndex: { $lt: operationIndex },
          type: OperationType.Update,
        },
      ],
    });
  }
}
