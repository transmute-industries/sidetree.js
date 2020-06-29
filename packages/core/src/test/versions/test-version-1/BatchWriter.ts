import {
  IBatchWriter,
  IBlockchain,
  ICas,
  IOperationQueue,
  IVersionMetadataFetcher,
} from '@sidetree/common';

/**
 * Batch writer.
 */
export default class BatchWriter implements IBatchWriter {
  public constructor(
    private operationQueue: IOperationQueue,
    private blockchain: IBlockchain,
    private cas: ICas,
    private versionMetadataFetcher: IVersionMetadataFetcher
  ) {
    console.debug(
      this.operationQueue,
      this.blockchain,
      this.cas,
      this.versionMetadataFetcher
    );
  }

  async write(): Promise<void> {
    throw new Error('BatchWriter: Not implemented. Version: TestVersion1');
  }
}
