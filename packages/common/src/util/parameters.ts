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

import ProtocolParameters from '../models/ProtocolParameters';

/**
 * Defines the list of protocol parameters, intended ONLY to be used within each version of Sidetree.
 */
const protocolParameters: ProtocolParameters = {
  hashAlgorithmInMultihashCode: 18,
  maxAnchorFileSizeInBytes: 1000000,
  maxChunkFileSizeInBytes: 20000000,
  maxDeltaSizeInBytes: 1000,
  maxMapFileSizeInBytes: 1000000,
  maxNumberOfOperationsPerTransactionTime: 600000,
  maxNumberOfTransactionsPerTransactionTime: 300,
  // If you are not using value lock, maxNumberOfOperationsForNoValueTimeLock
  // maxOperationsPerBatch should be the same
  maxNumberOfOperationsForNoValueTimeLock: 1000,
  maxOperationsPerBatch: 1000,
  normalizedFeeToPerOperationFeeMultiplier: 0.01,
  valueTimeLockAmountMultiplier: 600,
};
export default protocolParameters;
