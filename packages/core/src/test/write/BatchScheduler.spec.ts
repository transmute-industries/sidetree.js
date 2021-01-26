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

import retry from 'async-retry';
import BatchScheduler from '../../write/BatchScheduler';
import MockBatchWriter from '../mocks/MockBatchWriter';
import { MockLedger } from '@sidetree/ledger';
import MockVersionManager from '../mocks/MockVersionManager';

console.info = (): null => null;

describe('BatchScheduler', () => {
  it('should periodically invoke batch writer.', async () => {
    const blockchain = new MockLedger();
    const batchWriter = new MockBatchWriter();

    const versionManager = new MockVersionManager();
    const spy = jest.spyOn(versionManager, 'getBatchWriter');
    spy.mockReturnValue(batchWriter);

    const batchScheduler = new BatchScheduler(versionManager, blockchain, 1);

    batchScheduler.startPeriodicBatchWriting();

    // Monitor the Batch Scheduler until the Batch Writer is invoked or max retries is reached.
    await retry(
      async () => {
        if (batchWriter.invocationCount >= 2) {
          return;
        }

        // NOTE: if anything throws, we retry.
        throw new Error('Batch writer not invoked.');
      },
      {
        retries: 5,
        minTimeout: 1000, // milliseconds
        maxTimeout: 1000, // milliseconds
      }
    );

    batchScheduler.stopPeriodicBatchWriting();

    expect(batchWriter.invocationCount).toBeGreaterThanOrEqual(2);
  });
});
