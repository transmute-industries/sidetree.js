import { IBlockchain } from '@sidetree/common';

const anchorString = 'anAnchorString';

const testSuite = (ledger: IBlockchain): void => {
  describe(ledger.constructor.name, () => {
    describe('write', () => {
      it('should write to the ledger', async () => {
        await ledger.write(anchorString);
      });
    });

    describe('getApproximateTime', () => {
      it('should get latest cached blockchain time', async () => {
        // cachedTime should initially not be defined
        let cachedTime = await ledger.approximateTime;
        expect(cachedTime.time).toBe(0);
        expect(cachedTime.hash).toBe('');
        const realTime = await (ledger as any).getLatestTime();
        cachedTime = await ledger.approximateTime;
        expect(cachedTime.time).toBe(realTime.time);
        expect(cachedTime.hash).toBe(realTime.hash);
      });
    });

    describe('read', () => {
      it('should', async () => {
        const readResult = await ledger.read();
        expect(readResult.moreTransactions).toBeFalsy();
        expect(readResult.transactions).toHaveLength(1);
        expect(readResult.transactions[0].transactionNumber).toBe(0);
        expect(readResult.transactions[0].transactionTime).toBeDefined();
        expect(readResult.transactions[0].transactionTimeHash).toBeDefined();
        expect(readResult.transactions[0].anchorString).toBeDefined();
        expect(readResult.transactions[0].writer).toBeDefined();
      });
    });

    // describe('getFirstValidTransaction', () => {});
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
