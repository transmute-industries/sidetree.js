import TransactionModel from './TransactionModel';

/**
 * Unresolvable transaction model.
 */
export default interface UnresolvableTransactionModel extends TransactionModel {
  firstFetchTime: number;
  retryAttempts: number;
  nextRetryTime: number;
}
