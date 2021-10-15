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

import { filesystem } from '@sidetree/test-vectors';
import AWS from 'aws-sdk/global';

import QLDBLedger from '../QLDBLedger';
import MockQLDBLedger from '../MockQLDBLedger';

jest.setTimeout(10 * 1000);

describe('QLDB tests', () => {
  const forceMock = true;

  const config = new AWS.Config();
  if (forceMock) {
    console.warn('Using mock QLDB interface for QLDB tests');
  } else if (!config.credentials) {
    console.warn(
      'No AWS credentials found in ~/.aws/credentials, using mock interace'
    );
  }
  const ledger =
    config.credentials && !forceMock
      ? new QLDBLedger('photon-test', 'Test')
      : new MockQLDBLedger('Test');
  // TODO: use newer values for these eventually. 'core index file' instead of 'anchor file'
  const { anchorString, anchorString2, anchorString3 } = filesystem.anchorFile;
  let blockTime1: number;
  let blockTimeHash1: string;

  beforeAll(async () => {
    await ledger.reset();
    await ledger.initialize();
  });

  it('constructs object', async () => {
    const tableNames = await ledger.qldbDriver.getTableNames();
    expect(ledger.transactionTable).toBe('Test');
    expect(tableNames.includes(ledger.transactionTable)).toBeTruthy();
    expect(ledger.approximateTime).toEqual({ time: 0, hash: '' });
  });

  it('gets service version', async () => {
    const serviceVersion = await ledger.getServiceVersion();
    expect(serviceVersion).toBeDefined();
    expect(serviceVersion.name).toBe('qldb');
    expect(serviceVersion.version).toBeDefined();
  });

  it('writes to the ledger', async () => {
    const realTime = await ledger.getLatestTime();
    const cachedTime = await ledger.approximateTime;
    expect(realTime.time).toBeDefined();
    expect(realTime.hash).toBeDefined();
    expect(cachedTime.time).toBe(realTime.time);
    expect(cachedTime.hash).toBe(realTime.hash);
    const data = anchorString;
    await ledger.write(data);
    const realTime2 = await ledger.getLatestTime();
    const cachedTime2 = await ledger.approximateTime;
    blockTime1 = realTime2.time;
    blockTimeHash1 = realTime2.hash;
    console.log(realTime2);
    expect(realTime2.time).toBeDefined();
    expect(realTime2.hash).toBeDefined();
    expect(cachedTime2.time).toBe(realTime2.time);
    expect(cachedTime2.hash).toBe(realTime2.hash);
  });

  it('reads from ledger', async () => {
    const { moreTransactions, transactions } = await ledger.read(
      -1,
      blockTimeHash1
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);
    const [transaction] = transactions;
    expect(transaction).toEqual({
      anchorString,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: blockTime1,
      transactionTime: blockTime1,
      transactionTimeHash: blockTimeHash1,
      transactionTimestamp: transaction.transactionTimestamp,
      writer: 'writer',
    });
  });

  it('reads next transaction that got wrote', async () => {
    await ledger.write(anchorString2);
    const realTime = await ledger.getLatestTime();
    const { moreTransactions, transactions } = await ledger.read(
      blockTime1,
      realTime.hash
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);
    const [t1] = transactions;
    expect(t1).toEqual({
      anchorString: anchorString2,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: realTime.time,
      transactionTime: realTime.time,
      transactionTimeHash: realTime.hash,
      transactionTimestamp: t1.transactionTimestamp,
      writer: 'writer',
    });
  });

  it('gets multiple transactions', async () => {
    await ledger.write(anchorString3);
    const { moreTransactions, transactions } = await ledger.read(
      // In qldb, read sinceTransactionNumber is inclusive
      blockTime1 + 1,
      // This filters by block and every transaction is it's own block in qldb
      undefined
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(2);
  });

  it('should return no transaction if the requested transactionNumber has not been reached', async () => {
    const readResult = await ledger.read(
      Number.MAX_SAFE_INTEGER - 1,
      blockTimeHash1
    );
    expect(readResult.moreTransactions).toBeFalsy();
    expect(readResult.transactions).toHaveLength(0);
  });

  it('should return no transaction if the requested transactionTimeHash doesnt exist', async () => {
    const readResult = await ledger.read(-1, '0x123');
    expect(readResult.moreTransactions).toBeFalsy();
    expect(readResult.transactions).toHaveLength(0);
  });
});
