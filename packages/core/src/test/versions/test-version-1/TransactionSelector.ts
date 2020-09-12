import { ITransactionSelector, TransactionModel } from '@sidetree/common';

/**
 * test version of throughput limiter
 */
export default class TransactionSelector implements ITransactionSelector {
  public selectQualifiedTransactions(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel[]> {
    return new Promise(resolve => {
      resolve([]);
    });
  }
}
