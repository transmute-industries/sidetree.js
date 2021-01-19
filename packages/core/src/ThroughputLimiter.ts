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

import { IVersionManager, TransactionModel } from '@sidetree/common';

/**
 * Keeps track of current block and throughput limits based on the state
 */
export default class ThroughputLimiter {
  constructor(private versionManager: IVersionManager) {}

  /**
   * given a an array of transactions, return an array of qualified transactions per transaction time.
   * @param transactions array of transactions to filter for
   */
  public async getQualifiedTransactions(transactions: TransactionModel[]) {
    let currentTransactionTime: number | undefined = undefined;
    const transactionsGroupedByTransactionTime: TransactionModel[][] = [];

    for (const transaction of transactions) {
      // If transaction is transitioning into a new time, create a new grouping.
      if (transaction.transactionTime !== currentTransactionTime) {
        transactionsGroupedByTransactionTime.push([]);
        currentTransactionTime = transaction.transactionTime;
      }
      transactionsGroupedByTransactionTime[
        transactionsGroupedByTransactionTime.length - 1
      ].push(transaction);
    }

    const qualifiedTransactions: TransactionModel[] = [];
    for (const transactionGroup of transactionsGroupedByTransactionTime) {
      const transactionSelector = this.versionManager.getTransactionSelector(
        transactionGroup[0].transactionTime
      );
      const qualifiedTransactionsInCurrentGroup = await transactionSelector.selectQualifiedTransactions(
        transactionGroup
      );
      qualifiedTransactions.push(...qualifiedTransactionsInCurrentGroup);
    }
    return qualifiedTransactions;
  }
}
