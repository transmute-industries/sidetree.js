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
  AnchoredDataSerializer,
  ErrorCode,
  ITransactionSelector,
  ITransactionStore,
  SidetreeError,
  TransactionModel,
  protocolParameters,
} from '@sidetree/common';
import PriorityQueue from 'priorityqueue';

/**
 * rate limits how many operations is valid per block
 */
export default class TransactionSelector implements ITransactionSelector {
  private maxNumberOfOperationsPerBlock: number;
  private maxNumberOfTransactionsPerBlock: number;
  public constructor(private transactionStore: ITransactionStore) {
    this.maxNumberOfOperationsPerBlock =
      protocolParameters.maxNumberOfOperationsPerTransactionTime;
    this.maxNumberOfTransactionsPerBlock =
      protocolParameters.maxNumberOfTransactionsPerTransactionTime;
  }

  private static getTransactionPriorityQueue() {
    const comparator = (a: TransactionModel, b: TransactionModel) => {
      // higher fee comes first. If fees are the same, earlier transaction comes first
      return (
        a.transactionFeePaid - b.transactionFeePaid ||
        b.transactionNumber - a.transactionNumber
      );
    };

    return new PriorityQueue({ comparator });
  }

  /**
   * Returns an array of transactions that should be processed. Ranked by highest fee paid per transaction and up to the
   * max number of operations per block
   * @param transactions The transactions that should be ranked and considered to process
   */
  public async selectQualifiedTransactions(
    transactions: TransactionModel[]
  ): Promise<TransactionModel[]> {
    if (!transactions.length) {
      return [];
    }

    const transactionsPriorityQueue = TransactionSelector.getTransactionPriorityQueue();

    const currentTransactionTime = transactions[0].transactionTime;

    TransactionSelector.validateTransactions(
      transactions,
      currentTransactionTime
    );
    TransactionSelector.enqueueFirstTransactionFromEachWriter(
      transactions,
      currentTransactionTime,
      transactionsPriorityQueue
    );

    const [
      numberOfOperations,
      numberOfTransactions,
    ] = await this.getNumberOfOperationsAndTransactionsAlreadyInTransactionTime(
      currentTransactionTime
    );
    const numberOfOperationsToQualify =
      this.maxNumberOfOperationsPerBlock - numberOfOperations;
    const numberOfTransactionsToQualify =
      this.maxNumberOfTransactionsPerBlock - numberOfTransactions;

    const transactionsToReturn = TransactionSelector.getHighestFeeTransactionsFromCurrentTransactionTime(
      numberOfOperationsToQualify,
      numberOfTransactionsToQualify,
      transactionsPriorityQueue
    );

    return transactionsToReturn;
  }

  private static validateTransactions(
    transactions: TransactionModel[],
    currentTransactionTime: number
  ) {
    for (const transaction of transactions) {
      // expect all transactions to be in the same transaction time
      if (transaction.transactionTime !== currentTransactionTime) {
        throw new SidetreeError(
          ErrorCode.TransactionsNotInSameBlock,
          'transaction must be in the same block to perform rate limiting, investigate and fix'
        );
      }
    }
  }

  private static enqueueFirstTransactionFromEachWriter(
    transactions: TransactionModel[],
    currentTransactionTime: number,
    transactionsPriorityQueue: any
  ) {
    const writerToTransactionNumberMap = new Map();
    // if multiple transactions have the same writer, take the first one in the array and enqueue into transactionPriorityQueue
    for (const transaction of transactions) {
      // only 1 transaction is allowed per writer
      if (writerToTransactionNumberMap.has(transaction.writer)) {
        const acceptedTransactionNumber = writerToTransactionNumberMap.get(
          transaction.writer
        );
        // tslint:disable-next-line:max-line-length
        console.info(
          `Multiple transactions found in transaction time ${currentTransactionTime} from writer ${transaction.writer}, considering transaction ${acceptedTransactionNumber} and ignoring ${transaction.transactionNumber}`
        );
      } else {
        transactionsPriorityQueue.push(transaction);
        writerToTransactionNumberMap.set(
          transaction.writer,
          transaction.transactionNumber
        );
      }
    }
  }

  private async getNumberOfOperationsAndTransactionsAlreadyInTransactionTime(
    transactionTime: number
  ): Promise<number[]> {
    const transactions = await this.transactionStore.getTransactionsStartingFrom(
      transactionTime,
      transactionTime
    );
    let numberOfOperations = 0;
    if (transactions) {
      for (const transaction of transactions) {
        try {
          const numOfOperationsInCurrentTransaction = AnchoredDataSerializer.deserialize(
            transaction.anchorString
          ).numberOfOperations;
          numberOfOperations += numOfOperationsInCurrentTransaction;
        } catch (e) {
          console.debug(
            `Error thrown in TransactionSelector: ${JSON.stringify(
              e,
              Object.getOwnPropertyNames(e)
            )}`
          );
          console.info(
            `Transaction with anchor string ${transaction.anchorString} not considered as selected.`
          );
        }
      }
    }
    const numberOfTransactions = transactions ? transactions.length : 0;
    return [numberOfOperations, numberOfTransactions];
  }

  /**
   * Given transactions within a block, return the ones that should be processed.
   */
  private static getHighestFeeTransactionsFromCurrentTransactionTime(
    numberOfOperationsToQualify: number,
    numberOfTransactionsToQualify: number,
    transactionsPriorityQueue: any
  ): TransactionModel[] {
    let numberOfOperationsSeen = 0;
    const transactionsToReturn = [];

    while (
      transactionsToReturn.length < numberOfTransactionsToQualify &&
      numberOfOperationsSeen < numberOfOperationsToQualify &&
      transactionsPriorityQueue.length > 0
    ) {
      const currentTransaction = transactionsPriorityQueue.pop();
      try {
        const numOfOperationsInCurrentTransaction = AnchoredDataSerializer.deserialize(
          currentTransaction.anchorString
        ).numberOfOperations;
        numberOfOperationsSeen += numOfOperationsInCurrentTransaction;
        if (numberOfOperationsSeen <= numberOfOperationsToQualify) {
          transactionsToReturn.push(currentTransaction);
        }
      } catch (e) {
        console.debug(
          `Error thrown in TransactionSelector: ${JSON.stringify(
            e,
            Object.getOwnPropertyNames(e)
          )}`
        );
        console.info(
          `Transaction with anchor string ${currentTransaction.anchorString} not selected`
        );
      }
    }

    // sort based on transaction number ascending
    return transactionsToReturn;
  }
}
