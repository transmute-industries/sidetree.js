/*
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BlockchainTimeModel,
  IBlockchain,
  ServiceVersionModel,
  TransactionModel,
  ValueTimeLockModel,
} from '@sidetree/common';
const { version } = require('../package.json');

const startingBlockchainTime = 500000;
/**
 * Mock Blockchain class for testing.
 */
export default class MockLedger implements IBlockchain {
  public hashes: [string, number][] = [];

  getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'mock-ledger',
      version,
    });
  }
  initialize(): Promise<void> {
    return Promise.resolve();
  }
  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  getValueTimeLock(
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    // throw new Error('Method not implemented.');
    return Promise.resolve(undefined);
  }

  public async write(anchorString: string, fee = 0): Promise<void> {
    this.hashes.push([anchorString, fee]);
  }

  public async read(
    sinceTransactionNumber?: number,
    _transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    if (sinceTransactionNumber === undefined) {
      sinceTransactionNumber = -1;
    }

    let moreTransactions = false;
    if (
      this.hashes.length > 0 &&
      sinceTransactionNumber < this.hashes.length - 2
    ) {
      moreTransactions = true;
    }

    const transactions: TransactionModel[] = [];
    if (
      this.hashes.length > 0 &&
      sinceTransactionNumber < this.hashes.length - 1
    ) {
      const hashIndex = sinceTransactionNumber + 1;
      const transaction = {
        transactionNumber: hashIndex,
        transactionTime: startingBlockchainTime + hashIndex,
        transactionTimeHash: this.hashes[hashIndex][0],
        anchorString: this.hashes[hashIndex][0],
        transactionFeePaid: this.hashes[hashIndex][1],
        normalizedTransactionFee: this.hashes[hashIndex][1],
        writer: 'writer',
      };
      transactions.push(transaction);
    }

    return {
      moreTransactions: moreTransactions,
      transactions: transactions,
    };
  }
  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return undefined;
  }

  private latestTime?: BlockchainTimeModel = {
    time: startingBlockchainTime,
    hash: '',
  };

  public getLatestTime = (): Promise<BlockchainTimeModel> => {
    this.latestTime = {
      time: startingBlockchainTime + this.hashes.length,
      hash: 'dummyHash',
    };
    return Promise.resolve(this.latestTime);
  };

  public get approximateTime(): BlockchainTimeModel {
    return this.latestTime!;
  }
  /**
   * Hardcodes the latest time to be returned.
   */
  public setLatestTime(time: BlockchainTimeModel): void {
    this.latestTime = time;
  }
}
