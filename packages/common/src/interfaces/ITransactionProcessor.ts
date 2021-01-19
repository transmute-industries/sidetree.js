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

import TransactionModel from '../models/TransactionModel';

/**
 * Interface that defines a class that can process transactions fetched from blockchain.
 */
export default interface ITransactionProcessor {
  /**
   * Processes the given transactions.
   * This includes fetching the files referenced by the given transaction, validation, categorization of operations by DID, and storing the operations in DB.
   * @param transaction Transaction to process.
   * @returns true if the transaction is processed successfully (no retry required), false otherwise (retry required).
   */
  processTransaction(transaction: TransactionModel): Promise<boolean>;
}
