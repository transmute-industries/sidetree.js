/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/master/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IOperationStore,
  AnchoredOperationModel,
  OperationType,
} from '@sidetree/common';
import { createConnection, MongoRepository, Connection } from 'typeorm';
import Operation from './entity/Operation';

export default class OperationStore implements IOperationStore {
  private connection: Connection | undefined;
  private repo: MongoRepository<Operation> | undefined;

  private readonly databaseName: string;

  constructor(private serverUrl: string, databaseName?: string) {
    this.databaseName = databaseName ? databaseName : 'sidetree';
  }

  public async initialize(): Promise<void> {
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
  public async close(): Promise<void> {
    return this.connection!.close();
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
