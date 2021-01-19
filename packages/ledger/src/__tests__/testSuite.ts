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

import { IBlockchain } from '@sidetree/common';
import { filesystem } from '@sidetree/test-vectors';

const { anchorString, anchorString2, anchorString3 } = filesystem.anchorFile;

jest.setTimeout(10 * 1000);

const testSuite = (ledger: IBlockchain): void => {
  describe(ledger.constructor.name, () => {
    beforeAll(async () => {
      await ledger.initialize();
    });

    describe('getServiceVersion', () => {
      it('should get service version', async () => {
        const serviceVersion = await ledger.getServiceVersion();
        expect(serviceVersion).toBeDefined();
        expect(serviceVersion.name).toBeDefined();
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('should write to the ledger', async () => {
        await ledger.write(anchorString, 0);
      });
    });

    describe('getApproximateTime', () => {
      it('should get latest cached blockchain time', async () => {
        const realTime = await (ledger as any).getLatestTime();
        const cachedTime = await ledger.approximateTime;
        expect(cachedTime.time).toBe(realTime.time);
        expect(cachedTime.hash).toBe(realTime.hash);
      });
    });

    describe('read', () => {
      let transactionTimeHash: string;
      let sinceTransactionNumber: number;

      it('should get all transactions', async () => {
        const readResult = await ledger.read();
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(1);
        expect(readResult.transactions[0].transactionNumber).toBeDefined();
        expect(readResult.transactions[0].transactionTime).toBeDefined();
        expect(readResult.transactions[0].transactionTimeHash).toBeDefined();
        expect(readResult.transactions[0].anchorString).toBe(anchorString);
        expect(readResult.transactions[0].writer).toBeDefined();
        transactionTimeHash = readResult.transactions[0].transactionTimeHash;

        await ledger.write(anchorString2, 0);
        const readResult2 = await ledger.read();
        expect(readResult2.moreTransactions).toBeFalsy();
        expect(readResult2.transactions).toHaveLength(2);
        expect(readResult2.transactions[0].anchorString).toBe(anchorString);
        expect(readResult2.transactions[1].anchorString).toBe(anchorString2);
        sinceTransactionNumber = readResult2.transactions[1].transactionNumber;
      });

      it('should get a specific transaction', async () => {
        const readResult = await ledger.read(undefined, transactionTimeHash);
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(1);
        expect(readResult.transactions[0].transactionTimeHash).toBe(
          transactionTimeHash
        );
        expect(readResult.transactions[0].anchorString).toBe(anchorString);
      });

      it('should get all transactions since a block', async () => {
        await ledger.write(anchorString3, 0);
        const readResult = await ledger.read(sinceTransactionNumber);
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(2);
        expect(
          readResult.transactions[0].transactionNumber
        ).toBeGreaterThanOrEqual(sinceTransactionNumber);
        expect(
          readResult.transactions[1].transactionNumber
        ).toBeGreaterThanOrEqual(readResult.transactions[0].transactionNumber);
        expect(readResult.transactions[0].anchorString).toBe(anchorString2);
        expect(readResult.transactions[1].anchorString).toBe(anchorString3);
      });

      it('should return no transaction if the requested transactionNumber has not been reached', async () => {
        const readResult = await ledger.read(Number.MAX_SAFE_INTEGER - 1);
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(0);
      });

      it('should return no transaction if the requested transactionTimeHash doesnt exist', async () => {
        const readResult = await ledger.read(undefined, '0x123');
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(0);
      });
    });
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
