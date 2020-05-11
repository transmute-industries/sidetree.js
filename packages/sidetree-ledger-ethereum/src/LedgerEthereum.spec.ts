import { LedgerEthereum } from './LedgerEthereum';

import { web3, logger } from './__fixtures__';

describe('LedgerEthereum', () => {
  let ledger: any;
  it('constructor', () => {
    ledger = new LedgerEthereum(
      web3,
      '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
      logger
    );
    expect(ledger).toBeDefined();
  });

  it('can create new contracts on the fly', async () => {
    const instance = await ledger._createNewContract();
    expect(ledger.anchorContractAddress).toBe(instance.address);
  });

  describe('getBlockchainTime', () => {
    it('should return hash and blocknumber', async () => {
      const time = await ledger.getBlockchainTime(0);
      expect(typeof time).toBe('number');
    });
  });

  describe('getTransactions', () => {
    it('should return transactions from blockNumber', async () => {
      const txns = await ledger.getTransactions(0);
      expect(txns).toEqual([]);
    });
  });

  describe('write', () => {
    it('should return a element transaction for an anchorFileHash', async () => {
      const txn = await ledger.write(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
      expect(txn.anchorFileHash).toBe(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
      const txns = await ledger.getTransactions(0);
      expect(txns[0].anchorFileHash).toBe(
        'Qmc9Asse4CvAuQJ77vMARRqLYTrL4ZzWK8BKb2FHRAYcuD'
      );
    });
  });
});
