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

import { IOperationQueue, QueuedOperationModel } from '@sidetree/common';

/**
 * A mock in-memory operation queue used by the Batch Writer.
 */
export default class MockOperationQueue implements IOperationQueue {
  private latestTimestamp = 0;
  private operations: Map<string, [number, Buffer]> = new Map();

  async enqueue(didUniqueSuffix: string, operationBuffer: Buffer) {
    this.latestTimestamp++;
    this.operations.set(didUniqueSuffix, [
      this.latestTimestamp,
      operationBuffer,
    ]);
  }

  async dequeue(count: number): Promise<QueuedOperationModel[]> {
    // Sort the entries by their timestamp.
    // If compare function returns < 0, a is before b, vice versa.
    const sortedEntries = Array.from(this.operations.entries()).sort(
      (a, b) => a[1][0] - b[1][0]
    );
    const sortedQueuedOperations = sortedEntries.map((entry) => {
      return { didUniqueSuffix: entry[0], operationBuffer: entry[1][1] };
    });

    const sortedKeys = sortedEntries.map((entry) => entry[0]);
    const keyBatch = sortedKeys.slice(0, count);
    keyBatch.forEach((key) => this.operations.delete(key));

    const operationBatch = sortedQueuedOperations.slice(0, count);
    return operationBatch;
  }

  async peek(count: number): Promise<QueuedOperationModel[]> {
    // Sort the entries by their timestamp.
    const sortedEntries = Array.from(this.operations.entries()).sort(
      (a, b) => a[1][0] - b[1][0]
    );
    const sortedQueuedOperations = sortedEntries.map((entry) => {
      return { didUniqueSuffix: entry[0], operationBuffer: entry[1][1] };
    });

    const operationBatch = sortedQueuedOperations.slice(0, count);
    return operationBatch;
  }

  async contains(didUniqueSuffix: string): Promise<boolean> {
    return this.operations.has(didUniqueSuffix);
  }
}
