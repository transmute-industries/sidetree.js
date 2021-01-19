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

import { ITransactionStore, TransactionModel } from '@sidetree/common';
import { Cursor, Long } from 'mongodb';
import MongoDbBase from './MongoDbBase';

/**
 * Implementation of ITransactionStore that stores the transaction data in a MongoDB database.
 */
export default class MongoDbTransactionStore extends MongoDbBase
  implements ITransactionStore {
  readonly collectionName = 'transactions';

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.collection!.createIndex(
      { transactionNumber: 1 },
      { unique: true }
    );
  }

  /**
   * Returns the number of transactions in the store.
   * Mainly used by tests.
   */
  public async getTransactionsCount(): Promise<number> {
    const transactionCount = await this.collection!.countDocuments();
    return transactionCount;
  }

  public async getTransaction(
    transactionNumber: number
  ): Promise<TransactionModel | undefined> {
    const transactions = await this.collection!.find({
      transactionNumber: Long.fromNumber(transactionNumber),
    }).toArray();
    if (transactions.length === 0) {
      return undefined;
    }

    const transaction = transactions[0];
    return transaction;
  }

  public async getTransactionsLaterThan(
    transactionNumber: number | undefined,
    max: number | undefined
  ): Promise<TransactionModel[]> {
    let transactions = [];

    try {
      let dbCursor: Cursor<any>;

      // If given `undefined`, return transactions from the start.
      if (transactionNumber === undefined) {
        dbCursor = this.collection!.find();
      } else {
        dbCursor = this.collection!.find({
          transactionNumber: { $gt: Long.fromNumber(transactionNumber) },
        });
      }

      // If a limit is defined then set it.
      if (max) {
        dbCursor = dbCursor.limit(max);
      }

      // Sort the output
      dbCursor = dbCursor.sort({ transactionNumber: 1 });

      // Fetch the transactions
      transactions = await dbCursor.toArray();
    } catch (error) {
      console.error(error);
    }

    return transactions;
  }

  async addTransaction(transaction: TransactionModel): Promise<void> {
    try {
      const transactionInMongoDb = {
        anchorString: transaction.anchorString,
        // NOTE: MUST force `transactionNumber` to be Int64 in MongoDB.
        transactionNumber: Long.fromNumber(transaction.transactionNumber),
        transactionTime: transaction.transactionTime,
        transactionTimeHash: transaction.transactionTimeHash,
        transactionFeePaid: transaction.transactionFeePaid,
        normalizedTransactionFee: transaction.normalizedTransactionFee,
        writer: transaction.writer,
      };
      await this.collection!.insertOne(transactionInMongoDb);
    } catch (error) {
      // Swallow duplicate insert errors (error code 11000) as no-op; rethrow others
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  async getLastTransaction(): Promise<TransactionModel | undefined> {
    const lastTransactions = await this.collection!.find()
      .limit(1)
      .sort({ transactionNumber: -1 })
      .toArray();
    if (lastTransactions.length === 0) {
      return undefined;
    }

    const lastProcessedTransaction = lastTransactions[0];
    return lastProcessedTransaction;
  }

  async getExponentiallySpacedTransactions(): Promise<TransactionModel[]> {
    const exponentiallySpacedTransactions: TransactionModel[] = [];
    const allTransactions = await this.collection!.find()
      .sort({ transactionNumber: 1 })
      .toArray();

    let index = allTransactions.length - 1;
    let distance = 1;
    while (index >= 0) {
      exponentiallySpacedTransactions.push(allTransactions[index]);
      index -= distance;
      distance *= 2;
    }
    return exponentiallySpacedTransactions;
  }

  async removeTransactionsLaterThan(transactionNumber?: number): Promise<void> {
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
   * Gets the list of processed transactions.
   * Mainly used for test purposes.
   */
  public async getTransactions(): Promise<TransactionModel[]> {
    const transactions = await this.collection!.find()
      .sort({ transactionNumber: 1 })
      .toArray();
    return transactions;
  }

  /**
   * Gets a list of transactions between the bounds of transaction time. The smaller value will be inclusive while the bigger be exclusive
   * @param inclusiveBeginTransactionTime The first transaction time to begin querying for
   * @param exclusiveEndTransactionTime The transaction time to stop querying for
   */
  public async getTransactionsStartingFrom(
    inclusiveBeginTransactionTime: number,
    exclusiveEndTransactionTime: number
  ): Promise<TransactionModel[]> {
    let cursor: Cursor<any>;
    if (inclusiveBeginTransactionTime === exclusiveEndTransactionTime) {
      // if begin === end, query for 1 transaction time
      cursor = this.collection!.find({
        transactionTime: {
          $eq: Long.fromNumber(inclusiveBeginTransactionTime),
        },
      });
    } else {
      cursor = this.collection!.find({
        $and: [
          {
            transactionTime: {
              $gte: Long.fromNumber(inclusiveBeginTransactionTime),
            },
          },
          {
            transactionTime: {
              $lt: Long.fromNumber(exclusiveEndTransactionTime),
            },
          },
        ],
      });
    }

    const transactions: TransactionModel[] = await cursor
      .sort({ transactionNumber: 1 })
      .toArray();
    return transactions;
  }
}
