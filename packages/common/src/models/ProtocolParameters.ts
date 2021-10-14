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

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of the protocol implementation.
 */
export default interface ProtocolParameters {
  /** Supported hash algorithms in Multihash code in DEC (not in HEX). This list will/must only grow as algorithm support grows. */
  hashAlgorithmsInMultihashCode: number[];
  /** Maximum allowed CAS uri string length */
  maxCasUriLength: number;
  /** Maximum allowed size of core index file stored in Content Addressable Storage. */
  maxCoreIndexFileSizeInBytes: number;
  /** Maximum allowed size of provisional index file stored in Content Addressable Storage. */
  maxProvisionalIndexFileSizeInBytes: number;
  /** Maximum allowed size of core/provisional proof file stored in Content Addressable Storage. */
  maxProofFileSizeInBytes: number;
  /** Maximum allowed size of chunk file stored in Content Addressable Storage. */
  maxChunkFileSizeInBytes: number;
  /** Maximum size of the `delta` property in bytes. */
  maxDeltaSizeInBytes: number;
  /** Max number of operations observed per transaction time */
  maxNumberOfOperationsPerTransactionTime: number;
  /** Maximum number of operations allowed with no lock. */
  maxNumberOfOperationsForNoValueTimeLock: number;
  /** Max number of transactions observed per transaction time */
  maxNumberOfTransactionsPerTransactionTime: number;
  /** Maximum operations per batch. */
  maxOperationsPerBatch: number;
  /** Maximum writer lock ID in bytes. */
  maxWriterLockIdInBytes: number;
  /** The multiplier that converts the normalized fee from blockchain into a 'per operation' fee. */
  normalizedFeeToPerOperationFeeMultiplier: number;
  /** The multiplier that converts the normalized 'per operation' fee into 'per operation lock amount' */
  valueTimeLockAmountMultiplier: number;
}
