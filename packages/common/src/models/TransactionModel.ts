/**
 * Defines a Sidetree transaction.
 */
export default interface TransactionModel {
  transactionNumber: number;
  transactionTime: number;
  transactionHash: string;
  transactionTimeHash: string;
  anchorString: string;
  transactionFeePaid: number;
  normalizedTransactionFee: number;
  transactionTimestamp?: number;
  writer: string;
}
