/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
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
  ErrorCode,
  IOperationQueue,
  SidetreeError,
  QueuedOperationModel,
} from '@sidetree/common';
import { Binary, ObjectId } from 'mongodb';
import MongoDbBase from './MongoDbBase';

/**
 * Sidetree operation stored in MongoDb.
 * Note: we use the shorter property name "opIndex" instead of "operationIndex" due to a constraint imposed by CosmosDB/MongoDB:
 * the sum of property names of a unique index keys need to be less than 40 characters.
 * Note: We represent opIndex, transactionNumber, and transactionTime as long instead of number (double) to avoid some floating
 * point comparison quirks.
 */
interface IMongoQueuedOperation {
  _id?: ObjectId;
  didUniqueSuffix: string;
  operationBufferBsonBinary: Binary;
}

/**
 * Operation queue used by the Batch Writer implemented using MongoDB.
 */
export default class MongoDbOperationQueue extends MongoDbBase
  implements IOperationQueue {
  readonly collectionName = 'queued-operations';

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.collection!.createIndex(
      { didUniqueSuffix: 1 },
      { unique: true }
    );
  }

  async enqueue(
    didUniqueSuffix: string,
    operationBuffer: Buffer
  ): Promise<void> {
    try {
      const queuedOperation: IMongoQueuedOperation = {
        didUniqueSuffix,
        operationBufferBsonBinary: new Binary(operationBuffer),
      };

      await this.collection!.insertOne(queuedOperation);
    } catch (error) {
      // Duplicate insert errors (error code 11000).
      if (error.code === 11000) {
        throw new SidetreeError(ErrorCode.BatchWriterAlreadyHasOperationForDid);
      }

      throw error;
    }
  }

  async dequeue(count: number): Promise<QueuedOperationModel[]> {
    if (count <= 0) {
      return [];
    }

    const queuedOperations = await this.collection!.find()
      .sort({ _id: 1 })
      .limit(count)
      .toArray();
    const lastOperation = queuedOperations[queuedOperations.length - 1];
    await this.collection!.deleteMany({ _id: { $lte: lastOperation._id } });

    return queuedOperations.map((operation) =>
      MongoDbOperationQueue.convertToQueuedOperationModel(operation)
    );
  }

  async peek(count: number): Promise<QueuedOperationModel[]> {
    if (count <= 0) {
      return [];
    }

    // NOTE: `_id` is the default index that is sorted based by create time.
    const queuedOperations = await this.collection!.find()
      .sort({ _id: 1 })
      .limit(count)
      .toArray();

    return queuedOperations.map((operation) =>
      MongoDbOperationQueue.convertToQueuedOperationModel(operation)
    );
  }

  /**
   * Checks to see if the queue already contains an operation for the given DID unique suffix.
   */
  async contains(didUniqueSuffix: string): Promise<boolean> {
    const operations = await this.collection!.find({ didUniqueSuffix })
      .limit(1)
      .toArray();
    return operations.length > 0;
  }

  private static convertToQueuedOperationModel(
    mongoQueuedOperation: IMongoQueuedOperation
  ): QueuedOperationModel {
    return {
      didUniqueSuffix: mongoQueuedOperation.didUniqueSuffix,
      operationBuffer: mongoQueuedOperation.operationBufferBsonBinary.buffer,
    };
  }
}
