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

import ServiceVersionModel from '../models/ServiceVersionModel';
import BlockchainTimeModel from '../models/BlockchainTimeModel';
import TransactionModel from '../models/TransactionModel';
import ValueTimeLockModel from '../models/ValueTimeLockModel';

/**
 * Interface to access the underlying blockchain.
 * This interface is mainly useful for creating a mock Blockchain for testing purposes.
 */
export default interface IBlockchain {
  getServiceVersion(): ServiceVersionModel;
  getLatestTime(): Promise<BlockchainTimeModel>;
  initialize(): void;
  /**
   * Writes a Sidtree transaction with the given anchor string to blockchain.
   * @param anchorString Data to write to the blockchain.
   * @param fee Fee for the current transaction.
   */
  write(anchorString: string, fee: number): Promise<void>;

  /**
   * Gets Sidetree transactions in chronological order.
   * The function call may not return all known transactions, moreTransaction indicates if there are more transactions to be fetched.
   * When sinceTransactionNumber is not given, Sidetree transactions starting from inception will be returned.
   * When sinceTransactionNumber is given, only Sidetree transaction after the given transaction will be returned.
   * @param sinceTransactionNumber A valid Sidetree transaction number.
   * @param transactionTimeHash The hash associated with the anchored time of the transaction number given.
   *                            Required if and only if sinceTransactionNumber is provided.
   * @throws SidetreeError with ErrorCode.InvalidTransactionNumberOrTimeHash if a potential block reorganization is detected.
   */
  read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{
    moreTransactions: boolean;
    transactions: TransactionModel[];
  }>;

  /**
   * Given a list of Sidetree transaction in any order, iterate through the list and return the first transaction that is valid.
   * @param transactions List of potentially valid transactions.
   */
  getFirstValidTransaction(
    transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined>;

  /**
   * Gets the approximate latest time synchronously without requiring to make network call.
   * Useful for cases where high performance is desired and hgih accuracy is not required.
   */
  approximateTime: BlockchainTimeModel;

  /**
   * Fetches the normalized transaction fee used for proof-of-fee calculation, given the blockchain time.
   * @param transactionTime A valid Sidetree transaction time.
   *
   * @throws SidetreeError with ErrorCode.BlockchainTimeOutOfRange if the input transaction transactionTime is less
   * than Sidetree genesis blockchain time or is later than the current blockchain time.
   */
  getFee(transactionTime: number): Promise<number>;

  /**
   * Gets the lock object associated with the given lock identifier.
   *
   * @param lockIdentifier The identifier of the desired lock.
   * @returns the lock object if found; undefined otherwise.
   */
  getValueTimeLock(
    lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined>;

  /**
   * Gets the lock object required for batch writing.
   *
   * @returns the lock object if one exist; undefined otherwise.
   * @throws SidetreeError with ErrorCode.ValueTimeLockInPendingState if the lock is not yet confirmed on the blockchain.
   */
  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined>;
}
