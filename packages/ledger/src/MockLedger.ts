import {
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
} from '@sidetree/common';

/**
 * Mock Blockchain class for testing.
 */
export default class MockLedger implements IBlockchain {
  /** Stores each hash given in write() method. */
  hashes: [string][] = [];

  public async write(anchorString: string): Promise<void> {
    this.hashes.push([anchorString]);
  }

  public async read(
    sinceTransactionNumber?: number,
    _transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    let transactions: TransactionModel[] = this.hashes.map((hash, index) => ({
      transactionNumber: index,
      transactionTime: index,
      transactionTimeHash: hash[0],
      anchorString: hash[0],
      writer: 'writer',
    }));
    if (sinceTransactionNumber) {
      transactions = transactions.filter(
        t => t.transactionNumber >= sinceTransactionNumber
      );
    } else if (_transactionTimeHash) {
      transactions = transactions.filter(
        t => t.transactionTimeHash === _transactionTimeHash
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

  public getLatestTime = (): BlockchainTimeModel => {
    this.latestTime = {
      time: 500000,
      hash: 'dummyHash',
    };
    return this.latestTime;
  };

  public get approximateTime(): BlockchainTimeModel {
    return this.latestTime!;
  }
  /**
   * Hardcodes the latest time to be returned.
   */
  public setLatestTime(time: BlockchainTimeModel) {
    this.latestTime = time;
  }
}
