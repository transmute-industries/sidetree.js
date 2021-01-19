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
  IUnresolvableTransactionStore,
  TransactionModel,
} from '@sidetree/common';
import { Long } from 'mongodb';
import MongoDbBase from './MongoDbBase';

interface IUnresolvableTransaction extends TransactionModel {
  firstFetchTime: number;
  retryAttempts: number;
  nextRetryTime: number;
}

/**
 * Implementation of `IIUnresolvableTransactionStore` that stores the transaction data in a MongoDB database.
 */

export default class MongoDbUnresolvableTransactionStore extends MongoDbBase
  implements IUnresolvableTransactionStore {
  public readonly collectionName: string = 'unresolvable-transactions';

  private exponentialDelayFactorInMilliseconds = 60000;
  private maximumUnresolvableTransactionReturnCount = 100;

  /**
   * Constructs a `MongoDbUnresolvableTransactionStore`;
   * @param retryExponentialDelayFactor
   *   The exponential delay factor in milliseconds for retries of unresolvable transactions.
   *   e.g. if it is set to 1 seconds, then the delays for retries will be 1 second, 2 seconds, 4 seconds... until the transaction can be resolved.
   */
  constructor(
    serverUrl: string,
    databaseName: string,
    retryExponentialDelayFactor?: number
  ) {
    super(serverUrl, databaseName);

    if (retryExponentialDelayFactor !== undefined) {
      this.exponentialDelayFactorInMilliseconds = retryExponentialDelayFactor;
    }
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.collection!.createIndex(
      { transactionTime: 1, transactionNumber: 1 },
      { unique: true }
    );
    await this.collection!.createIndex({
      nextRetryTime: 1,
    });
  }

  async recordUnresolvableTransactionFetchAttempt(
    transaction: TransactionModel
  ): Promise<void> {
    // Try to get the unresolvable transaction from store.
    const transactionTime = transaction.transactionTime;
    const transactionNumber = transaction.transactionNumber;
    const searchFilter = {
      transactionTime,
      transactionNumber: Long.fromNumber(transactionNumber),
    };
    const findResults = await this.collection!.find(searchFilter).toArray();
    let unresolvableTransaction: IUnresolvableTransaction | undefined;
    if (findResults && findResults.length > 0) {
      unresolvableTransaction = findResults[0];
    }

    // If unresolvable transaction not found in store, insert a new one; else update the info on retry attempts.
    if (unresolvableTransaction === undefined) {
      const newUnresolvableTransaction = {
        transactionTime,
        transactionNumber: Long.fromNumber(transactionNumber),
        anchorString: transaction.anchorString,
        transactionTimeHash: transaction.transactionTimeHash,
        firstFetchTime: Date.now(),
        retryAttempts: 0,
        nextRetryTime: Date.now(),
      };

      await this.collection!.insertOne(newUnresolvableTransaction);
    } else {
      const retryAttempts = unresolvableTransaction.retryAttempts + 1;

      // Exponentially delay the retry the more attempts are done in the past.
      const anchorString = transaction.anchorString;
      const requiredElapsedTimeSinceFirstFetchBeforeNextRetry =
        Math.pow(2, unresolvableTransaction.retryAttempts) *
        this.exponentialDelayFactorInMilliseconds;
      const requiredElapsedTimeInSeconds =
        requiredElapsedTimeSinceFirstFetchBeforeNextRetry / 1000;
      console.info(
        `Record transaction ${transactionNumber} with anchor string ${anchorString} to retry after ${requiredElapsedTimeInSeconds} seconds.`
      );
      const nextRetryTime =
        unresolvableTransaction.firstFetchTime +
        requiredElapsedTimeSinceFirstFetchBeforeNextRetry;

      const searchFilter = {
        transactionTime,
        transactionNumber: Long.fromNumber(transactionNumber),
      };
      await this.collection!.updateOne(searchFilter, {
        $set: { retryAttempts, nextRetryTime },
      });
    }
  }

  async removeUnresolvableTransaction(
    transaction: TransactionModel
  ): Promise<void> {
    const transactionTime = transaction.transactionTime;
    const transactionNumber = transaction.transactionNumber;
    await this.collection!.deleteOne({
      transactionTime,
      transactionNumber: Long.fromNumber(transactionNumber),
    });
  }

  async getUnresolvableTransactionsDueForRetry(
    maximumReturnCount?: number
  ): Promise<TransactionModel[]> {
    // Override the return count if it is specified.
    let returnCount = this.maximumUnresolvableTransactionReturnCount;
    if (maximumReturnCount !== undefined) {
      returnCount = maximumReturnCount;
    }

    const now = Date.now();
    const unresolvableTransactionsToRetry = await this.collection!.find({
      nextRetryTime: { $lte: now },
    })
      .sort({ nextRetryTime: 1 })
      .limit(returnCount)
      .toArray();

    return unresolvableTransactionsToRetry;
  }

  async removeUnresolvableTransactionsLaterThan(
    transactionNumber?: number
  ): Promise<void> {
    // If given `undefined`, remove all transactions.
    if (transactionNumber === undefined) {
      await this.clearCollection();
      return;
    }

    await this.collection!.deleteMany({
      transactionNumber: { $gt: Long.fromNumber(transactionNumber) },
    });
  }

  /**
   * Gets the list of unresolvable transactions.
   * Mainly used for test purposes.
   */
  public async getUnresolvableTransactions(): Promise<
    IUnresolvableTransaction[]
  > {
    const transactions = await this.collection!.find()
      .sort({ transactionTime: 1, transactionNumber: 1 })
      .toArray();
    return transactions;
  }
}
