import { IBlockchain } from '@sidetree/common';

const anchorString = 'anAnchorString';

const testSuite = (ledger: IBlockchain): void => {
  describe(ledger.constructor.name, () => {
    describe('write', () => {
      it('should', async () => {
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
        expect(readResult.transactions[0]).toEqual({
          transactionNumber: 0,
          transactionTime: 0,
          transactionTimeHash: 'anAnchorString',
          anchorString: 'anAnchorString',
          writer: 'writer',
        });
      });
    });

    // describe('getFirstValidTransaction', () => {});
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
