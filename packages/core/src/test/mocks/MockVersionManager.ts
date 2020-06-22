import {
  IBatchWriter,
  IOperationProcessor,
  IVersionManager,
  ITransactionSelector,
} from '@sidetree/common';

/**
 * Mock version manager for testing.
 */
export default class MockVersionManager implements IVersionManager {
  // Hard-coded to support only SHA256.
  public allSupportedHashAlgorithms = [18];

  public getBatchWriter(blockchainTime: number): IBatchWriter {
    throw new Error(
      'Not implemented. Use spyOn to override the functionality. Input: ' +
        blockchainTime
    );
  }
  public getOperationProcessor(blockchainTime: number): IOperationProcessor {
    throw new Error(
      'Not implemented. Use spyOn to override the functionality. Input: ' +
        blockchainTime
    );
  }
  // public getRequestHandler(blockchainTime: number): IRequestHandler {
  //   throw new Error(
  //     'Not implemented. Use spyOn to override the functionality. Input: ' +
  //       blockchainTime
  //   );
  // }
  // public getTransactionProcessor(
  //   blockchainTime: number
  // ): ITransactionProcessor {
  //   throw new Error(
  //     'Not implemented. Use spyOn to override the functionality. Input: ' +
  //       blockchainTime
  //   );
  // }
  public getTransactionSelector(blockchainTime: number): ITransactionSelector {
    throw new Error(
      'Not implemented. Use spyOn to override the functionality. Input: ' +
        blockchainTime
    );
  }
}
