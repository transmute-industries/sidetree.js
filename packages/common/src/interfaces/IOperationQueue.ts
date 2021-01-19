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

import QueuedOperationModel from '../models/QueuedOperationModel';

/**
 * An abstraction of a queue of operations used by the Batch Writer.
 */
export default interface IOperationQueue {
  /**
   * Places an operation at the tail of the queue.
   * If there is already an operation for the same DID, Sidetree Error is thrown with 'code': 'batch_writer_already_has_operation_for_did'.
   */
  enqueue(didUniqueSuffix: string, operationBuffer: Buffer): Promise<void>;

  /**
   * Removes the given count of operation buffers from the beginning of the queue.
   */
  dequeue(count: number): Promise<QueuedOperationModel[]>;

  /**
   * Fetches the given count of operation buffers from the beginning of the queue without removing them.
   */
  peek(count: number): Promise<QueuedOperationModel[]>;

  /**
   * Checks to see if the queue already contains an operation for the given DID unique suffix.
   */
  contains(didUniqueSuffix: string): Promise<boolean>;
}
