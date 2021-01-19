/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IBlockchain, IVersionManager } from '@sidetree/common';
import timeSpan from 'time-span';

/**
 * Class that performs periodic writing of batches of Sidetree operations to CAS and blockchain.
 */
export default class BatchScheduler {
  /**
   * Denotes if the periodic batch writing should continue to occur.
   * Used mainly for test purposes.
   */
  private continuePeriodicBatchWriting = false;

  public constructor(
    private versionManager: IVersionManager,
    private blockchain: IBlockchain,
    private batchingIntervalInSeconds: number
  ) {}

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  public startPeriodicBatchWriting() {
    this.continuePeriodicBatchWriting = true;
    setImmediate(async () => this.writeOperationBatch());
  }

  /**
   * Stops periodic batch writing.
   * Mainly used for test purposes.
   */
  public stopPeriodicBatchWriting() {
    console.info(`Stopped periodic batch writing.`);
    this.continuePeriodicBatchWriting = false;
  }

  /**
   * Processes the operations in the queue.
   */
  public async writeOperationBatch() {
    const endTimer = timeSpan(); // For calcuating time taken to write operations.

    try {
      console.info('Start operation batch writing...');

      // Get the correct version of the `BatchWriter`.
      const currentTime = this.blockchain.approximateTime.time;
      const batchWriter = this.versionManager.getBatchWriter(currentTime);

      await batchWriter.write();
    } catch (error) {
      console.error(
        'Unexpected and unhandled error during batch writing, investigate and fix:'
      );
      console.error(error);
    } finally {
      console.info(`End batch writing. Duration: ${endTimer.rounded()} ms.`);

      if (this.continuePeriodicBatchWriting) {
        console.info(
          `Waiting for ${this.batchingIntervalInSeconds} seconds before writing another batch.`
        );
        setTimeout(
          async () => this.writeOperationBatch(),
          this.batchingIntervalInSeconds * 1000
        );
      }
    }
  }
}
