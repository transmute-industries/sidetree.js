import TransactionModel from '../models/TransactionModel';
import TransactionProcessingStatus from '../enums/TransactionProcessingStatus';

/**
 * Data structure for holding a transaction that is being processed and its state.
 */
export default interface TransactionUnderProcessingModel {
  transaction: TransactionModel;
  processingStatus: TransactionProcessingStatus;
}
