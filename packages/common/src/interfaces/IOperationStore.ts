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

import AnchoredOperationModel from '../models/AnchoredOperationModel';

/**
 * An abstraction of a complete store for operations exposing methods to
 * put and get operations.
 */
export default interface IOperationStore {
  /**
   * Stores a batch of operations
   * @param operations The list of operations to be stored, where the key of the map is the DID unique suffix.
   */
  put(operations: AnchoredOperationModel[]): Promise<void>;

  /**
   * Gets all operations of the given DID unique suffix in ascending chronological order.
   */
  get(didUniqueSuffix: string): Promise<AnchoredOperationModel[]>;

  /**
   * Deletes all operations with transaction number greater than the
   * provided parameter.
   */
  delete(transactionNumber?: number): Promise<void>;

  /**
   * Deletes all the operations of the given DID earlier than the specified operation.
   */
  deleteUpdatesEarlierThan(
    didUniqueSuffix: string,
    transactionNumber: number,
    operationIndex: number
  ): Promise<void>;

  close(): Promise<void>;
}
