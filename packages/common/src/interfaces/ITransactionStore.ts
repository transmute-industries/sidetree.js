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

import TransactionModel from '../models/TransactionModel';

/**
 * An abstraction for the persistence of Sidetree transactions.
 * Used to avoid re-fetching and reprocessing of transactions when the Sidetree node crashes or restarts.
 */
export default interface ITransactionStore {
  /**
   * Idempotent method that adds the given transaction to the list of transactions.
   */
  addTransaction(transaction: TransactionModel): Promise<void>;

  /**
   * Gets the most recent transaction. Returns undefined if there is no transaction.
   */
  getLastTransaction(): Promise<TransactionModel | undefined>;

  /**
   * Gets a list of exponentially-spaced transactions in reverse chronological sorted order
   * where the first element in the returned list is the chronologically last transaction in the store.
   */
  getExponentiallySpacedTransactions(): Promise<TransactionModel[]>;

  /**
   * Returns the specified transaction.
   * @param transactionNumber Transaction number of the transaction to be returned.
   */
  getTransaction(
    transactionNumber: number
  ): Promise<TransactionModel | undefined>;

  /**
   * Given a transaction times, return a list of transactions that are between the specified times
   * @param inclusiveBeginTransactionTime The first transaction time to query for
   * @param exclusiveEndTransactionTime The transaction time to stop querying for
   */
  getTransactionsStartingFrom(
    inclusiveBeginTransactionTime: number,
    exclusiveEndTransactionTime: number
  ): Promise<TransactionModel[] | undefined>;

  /**
   * Returns at most @param max transactions with transactionNumber greater than @param transactionNumber
   * If @param transactionNumber is undefined, returns transactions from index 0 in the store
   */
  getTransactionsLaterThan(
    transactionNumber: number | undefined,
    max: number | undefined
  ): Promise<TransactionModel[]>;

  /**
   * Remove all transactions with transaction number greater than the provided parameter.
   * If `undefined` is given, remove all transactions.
   */
  removeTransactionsLaterThan(transactionNumber?: number): Promise<void>;
}
