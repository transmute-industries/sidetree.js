import { filesystem } from '@evan.network/sidetree-test-vectors';

import MockLedger from '../MockLedger';

describe('MockLedger', () => {
  const ledger = new MockLedger();
  // TODO: use newer values for these eventually. 'core index file' instead of 'anchor file'
  const { anchorString, anchorString2, anchorString3 } = filesystem.anchorFile;
  const fee = 0;
  const transactionNumber1 = 0;
  const transactionNumber2 = 1;
  const blockTimeHash1 =
    '8d6962a152aee235ba824c41758b8da2371b7077b4ea0afaaec94014e16e3bc7';
  const blockTimeHash2 =
    '885c4f65f628522e6cd140c6ab76f79a52634ae63ac3f6d5a33592ccc243b07c';

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
    expect(realTime.hash).toBe(blockTimeHash1);
    expect(cachedTime.time).toBe(realTime.time);
    expect(cachedTime.hash).toBe(realTime.hash);
    const data = anchorString;
    await ledger.write(data, fee);
    expect(ledger.hashes).toEqual([[anchorString, 0]]);
    const realTime2 = await ledger.getLatestTime();
    const cachedTime2 = await ledger.approximateTime;
    expect(realTime2.time).toBe(500001);
    expect(realTime2.hash).toBe(blockTimeHash2);
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
      transactionNumber: 0,
      transactionTime: 500000,
      transactionTimeHash: blockTimeHash1,
      writer: 'writer',
    });
  });

  it('reads next transaction that got wrote', async () => {
    await ledger.write(anchorString2, fee);
    const realTime = await ledger.getLatestTime();
    const { moreTransactions, transactions } = await ledger.read(
      transactionNumber1,
      realTime.hash
    );
    expect(moreTransactions).toBeFalsy();
    expect(transactions).toHaveLength(1);
    const [t1] = transactions;
    expect(t1).toEqual({
      anchorString: anchorString2,
      normalizedTransactionFee: 0,
      transactionFeePaid: 0,
      transactionNumber: transactionNumber2,
      transactionTime: 500001,
      transactionTimeHash: blockTimeHash2,
      writer: 'writer',
    });
    expect(realTime.time).toBe(500002);
  });

  it('gets multiple transactions since a block', async () => {
    await ledger.write(anchorString3, 0);
    const { moreTransactions, transactions } = await ledger.read(
      0,
      blockTimeHash2
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
