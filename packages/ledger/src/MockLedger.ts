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

/**
 * Mock Blockchain class for testing.
 */
export default class MockLedger implements IBlockchain {
  getServiceVersion(): ServiceVersionModel {
    return {
      name: 'mock-ledger',
      version,
    };
  }
  initialize(): Promise<void> {
    return Promise.resolve();
  }
  getFee(_transactionTime: number): Promise<number> {
    throw new Error('Method not implemented.');
  }

  getValueTimeLock(
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    throw new Error('Method not implemented.');
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    throw new Error('Method not implemented.');
  }

  /** Stores each hash given in write() method. */
  hashes: [string][] = [];

  public async write(anchorString: string, _fee = 0): Promise<void> {
    this.hashes.push([anchorString]);
  }

  public async read(
    sinceTransactionNumber?: number,
    _transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    let transactions: TransactionModel[] = this.hashes.map((hash, index) => ({
      transactionNumber: index,
      transactionTime: index,
      transactionHash: hash[0],
      transactionTimeHash: hash[0],
      anchorString: hash[0],
      writer: 'writer',
      transactionFeePaid: 0,
      normalizedTransactionFee: 0,
    }));
    if (sinceTransactionNumber) {
      transactions = transactions.filter(
        (t) => t.transactionNumber >= sinceTransactionNumber
      );
    } else if (_transactionTimeHash) {
      transactions = transactions.filter(
        (t) => t.transactionTimeHash === _transactionTimeHash
      );
    }

    return {
      moreTransactions: false,
      transactions: transactions,
    };
  }

  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return undefined;
  }

  private latestTime?: BlockchainTimeModel = {
    time: 0,
    hash: '',
  };

  public getLatestTime = (): Promise<BlockchainTimeModel> => {
    this.latestTime = {
      time: 500000,
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
