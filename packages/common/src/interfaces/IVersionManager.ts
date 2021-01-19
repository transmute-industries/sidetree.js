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

import IBatchWriter from './IBatchWriter';
import IOperationProcessor from './IOperationProcessor';
import IRequestHandler from './IRequestHandler';
import ITransactionProcessor from './ITransactionProcessor';
import ITransactionSelector from './ITransactionSelector';
import IOperationQueue from './IOperationQueue';

/**
 * Defines an interface to return the correct 'version-ed' objects.
 */
export default interface IVersionManager {
  /** All the supported hash algorithms. */
  allSupportedHashAlgorithms: number[];

  /**
   * Gets the batchwriter for the given blockchain time.
   * @param blockchainTime The blockchain time for which the batchwriter is needed.
   */
  getBatchWriter(blockchainTime: number): IBatchWriter;

  /**
   * Gets the operation processor for the given blockchain time.
   * @param blockchainTime The blockchain time for which the operation processor is needed.
   */
  getOperationProcessor(blockchainTime: number): IOperationProcessor;

  /**
   * Gets the request handler for the given blockchain time.
   * @param blockchainTime The blockchain time for which the requesthandler is needed.
   */
  getRequestHandler(blockchainTime: number): IRequestHandler;

  /**
   * Gets the transaction process for the given blockchain time.
   * @param blockchainTime The blockchain time for which the transaction processor is needed.
   */
  getTransactionProcessor(blockchainTime: number): ITransactionProcessor;

  /**
   * Gets the transaction selector for the given blockchain time.
   * @param blockchainTime The blockchain time for which to be filtered
   */
  getTransactionSelector(blockchainTime: number): ITransactionSelector;

  /**
   * Gets the operation queue for the given blockchain time.
   * @param blockchainTime The blockchain time for which to be filtered
   */
  getOperationQueue(blockchainTime: number): IOperationQueue;
}
