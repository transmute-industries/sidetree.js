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
export default interface IUnresolvableTransactionStore {
  /**
   * Records the retry attempts of the given unresolvable transaction.
   */
  recordUnresolvableTransactionFetchAttempt(
    transaction: TransactionModel
  ): Promise<void>;

  /**
   * Remove the given transaction from the list of unresolvable transactions.
   * No-op if the transaction does not exist in the list of unresolvable transactions.
   */
  removeUnresolvableTransaction(transaction: TransactionModel): Promise<void>;

  /**
   * Gets a list of unresolvable transactions due for retry processing.
   * @param maxReturnCount
   *   The maximum count of unresolvable transactions to return retry.
   *   If not given, the implementation determines the number of unresolvable transactions to return.
   */
  getUnresolvableTransactionsDueForRetry(
    maxReturnCount?: number
  ): Promise<TransactionModel[]>;

  /**
   * Remove all unresolvable transactions with transaction number greater than the provided parameter.
   * If `undefined` is given, remove all transactions.
   */
  removeUnresolvableTransactionsLaterThan(
    transactionNumber?: number
  ): Promise<void>;
}
