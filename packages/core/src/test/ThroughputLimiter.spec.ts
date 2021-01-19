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

import { ITransactionSelector } from '@sidetree/common';
import TransactionSelector from '../TransactionSelector';
import MockVersionManager from './mocks/MockVersionManager';
import MockTransactionStore from './mocks/MockTransactionStore';
import ThroughputLimiter from '../ThroughputLimiter';

describe('ThroughputLimiter', () => {
  let throughputLimiter: ThroughputLimiter;
  const versionManager = new MockVersionManager();
  let transactionSelector: ITransactionSelector;
  beforeEach(() => {
    transactionSelector = new TransactionSelector(new MockTransactionStore());
    spyOn(transactionSelector, 'selectQualifiedTransactions').and.callFake(
      (transactions) => {
        // mock selecting the first one
        return new Promise((resolve) => {
          resolve([transactions[0]]);
        });
      }
    );
    spyOn(versionManager, 'getTransactionSelector').and.returnValue(
      transactionSelector
    );
    throughputLimiter = new ThroughputLimiter(versionManager);
  });

  describe('getQualifiedTransactions', () => {
    it('should execute with expected behavior', async () => {
      const transactions = [
        {
          transactionNumber: 1,
          transactionTime: 1,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 333,
          normalizedTransactionFee: 1,
          writer: 'writer1',
        },
        {
          transactionNumber: 2,
          transactionTime: 2,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 998,
          normalizedTransactionFee: 1,
          writer: 'writer2',
        },
        {
          transactionNumber: 3,
          transactionTime: 2,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 999,
          normalizedTransactionFee: 1,
          writer: 'writer3',
        },
        {
          transactionNumber: 4,
          transactionTime: 3,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 14,
          normalizedTransactionFee: 1,
          writer: 'writer4',
        },
      ];

      const result = await throughputLimiter.getQualifiedTransactions(
        transactions
      );

      const expected = [
        {
          transactionNumber: 1,
          transactionTime: 1,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 333,
          normalizedTransactionFee: 1,
          writer: 'writer1',
        },
        {
          transactionNumber: 2,
          transactionTime: 2,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 998,
          normalizedTransactionFee: 1,
          writer: 'writer2',
        },
        {
          transactionNumber: 4,
          transactionTime: 3,
          transactionHash: 'hash',
          transactionTimeHash: 'some hash',
          anchorString: 'some string',
          transactionFeePaid: 14,
          normalizedTransactionFee: 1,
          writer: 'writer4',
        },
      ];

      expect(
        transactionSelector.selectQualifiedTransactions
      ).toHaveBeenCalledTimes(3);
      expect(result).toEqual(expected);
    });
  });
});
