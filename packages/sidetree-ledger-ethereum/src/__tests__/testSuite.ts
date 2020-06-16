import { IBlockchain } from '@sidetree/common';

const anchorString = 'anAnchorString';

const testSuite = (ledger: IBlockchain): void => {
  describe(ledger.constructor.name, () => {
    describe('write', () => {
      it('should', async () => {
        await ledger.write(anchorString);
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
