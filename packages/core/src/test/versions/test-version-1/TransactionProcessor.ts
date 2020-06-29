import DownloadManager from '../../../DownloadManager';
import {
  IBlockchain,
  IOperationStore,
  ITransactionProcessor,
  IVersionMetadataFetcher,
  TransactionModel,
} from '@sidetree/common';

/**
 * Transaction processor.
 */
export default class TransactionProcessor implements ITransactionProcessor {
  public constructor(
    private downloadManager: DownloadManager,
    private operationStore: IOperationStore,
    private blockchain: IBlockchain,
    private versionMetadataFetcher: IVersionMetadataFetcher
  ) {
    console.debug(
      this.downloadManager,
      this.operationStore,
      this.blockchain,
      this.versionMetadataFetcher
    );
  }

  async processTransaction(transaction: TransactionModel): Promise<boolean> {
    throw new Error(
      `TransactionProcessor: Not implemented. Version: TestVersion1. Inputs: ${transaction}`
    );
  }
}
