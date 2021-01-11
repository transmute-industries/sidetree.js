/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AnchoredOperationModel,
  IOperationStore,
  OperationType,
} from '@sidetree/common';
import MongoDbBase from './MongoDbBase';

export default class MongoDbOperationStore extends MongoDbBase
  implements IOperationStore {
  readonly collectionName = 'operation';

  public async initialize(): Promise<void> {
    await super.initialize();
    // await this.collection!.createIndex({ hash: 1 }, { unique: true });
  }

  public async put(operations: AnchoredOperationModel[]): Promise<void> {
    // Remove duplicates (same operationIndex) from the operations array
    const operationsWithoutDuplicates = operations.reduce(
      (opsWithoutDuplicates: AnchoredOperationModel[], operation) => {
        const exists = opsWithoutDuplicates.find(
          (op) => op.operationIndex === operation.operationIndex
        );
        if (exists) {
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
        (op) =>
          op.operationIndex === anchoredOperation.operationIndex &&
          op.transactionNumber === anchoredOperation.transactionNumber
      );
      if (!isDuplicated) {
        onlyNewElements.push(anchoredOperation);
      }
    }
    if (onlyNewElements.length > 0) {
      await this.collection!.insertMany(onlyNewElements);
    }
  }

  public async get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]> {
    const results = await this.collection!.find({
      didUniqueSuffix,
    }).toArray();
    // Ensure operations are sorted by increasing order of operationIndex
    results.sort((op1, op2) => op1.operationIndex - op2.operationIndex);
    return results;
  }

  public async delete(transactionNumber?: number): Promise<void> {
    if (transactionNumber) {
      await this.collection!.deleteMany({
        transactionNumber: { $gt: transactionNumber },
      });
    } else {
      await this.collection!.deleteMany({});
    }
  }

  public async deleteUpdatesEarlierThan(
    didUniqueSuffix: string,
    transactionNumber: number,
    operationIndex: number
  ): Promise<void> {
    await this.collection!.deleteMany({
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
