import { filesystem } from '@sidetree/test-vectors';

import MockLedger from '../MockLedger';

describe('MockLedger', () => {
  const ledger = new MockLedger();
  const { anchorString, anchorString2, anchorString3 } = filesystem.anchorFile;
  const fee = 0;
  let firstTransactionTimedHash: string;
  let secondTransactionNumber: number;

  beforeAll(async () => {
    await ledger.initialize();
  });

  it('constructs object', async () => {
    expect(ledger.hashes).toEqual([]);
  });

  it('gets service version', async () => {
    const serviceVersion = await ledger.getServiceVersion();
    expect(serviceVersion).toBeDefined();
    expect(serviceVersion.name).toBe('mock-ledger');
    expect(serviceVersion.version).toBeDefined();
  });

  it('writes to the ledger', async () => {
    expect(ledger.hashes).toEqual([]);
    const realTime = await ledger.getLatestTime();
    const cachedTime = await ledger.approximateTime;
    expect(realTime.time).toBe(500000);
    expect(realTime.hash).toBe('dummyHash');
    expect(cachedTime.time).toBe(realTime.time);
    expect(cachedTime.hash).toBe(realTime.hash);
    const data = anchorString;
    await ledger.write(data, fee);
    expect(ledger.hashes).toEqual([[anchorString, 0]]);
    const realTime2 = await ledger.getLatestTime();
    const cachedTime2 = await ledger.approximateTime;
    expect(realTime2.time).toBe(500001);
    expect(realTime2.hash).toBe('dummyHash');
    expect(cachedTime2.time).toBe(realTime2.time);
    expect(cachedTime2.hash).toBe(realTime2.hash);
  });

  it('reads from ledger', async () => {
    const { moreTransactions, transactions } = await ledger.read();
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);
    const [transaction] = transactions;
    expect(transaction).toEqual({
      anchorString,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: 0,
      transactionTime: 500000,
      transactionTimeHash: anchorString,
      writer: 'writer',
    });
    firstTransactionTimedHash = transaction.transactionTimeHash;
  });

  it('reads next transaction that got wrote', async () => {
    await ledger.write(anchorString2, fee);
    const { moreTransactions, transactions } = await ledger.read();
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(2);
    const [t1, t2] = transactions;
    expect(t1).toEqual({
      anchorString,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: 0,
      transactionTime: 500000,
      transactionTimeHash: anchorString,
      writer: 'writer',
    });
    expect(t2).toEqual({
      anchorString: anchorString2,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: 1,
      transactionTime: 500001,
      transactionTimeHash: anchorString2,
      writer: 'writer',
    });
    secondTransactionNumber = t2.transactionNumber;
    const realTime = await ledger.getLatestTime();
    expect(realTime.time).toBe(500002);
  });

  it('reads a specific transaction', async () => {
    const { moreTransactions, transactions } = await ledger.read(
      undefined,
      firstTransactionTimedHash
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].transactionTimeHash).toBe(firstTransactionTimedHash);
    expect(transactions[0].anchorString).toBe(anchorString);
  });

  it('gets all transactions since a block', async () => {
    await ledger.write(anchorString3, 0);
    const { moreTransactions, transactions } = await ledger.read(
      secondTransactionNumber
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);

    expect(secondTransactionNumber).toBe(secondTransactionNumber);
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
