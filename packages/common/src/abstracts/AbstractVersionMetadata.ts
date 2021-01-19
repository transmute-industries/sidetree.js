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
 * Holds metadata for a particular Sidetree version needed by the orchestration layer classes across all versions of the Sidetree.
 */
export default abstract class AbstractVersionMetadata {
  /** Hash algorithm in Multihash code in DEC (not in HEX). */
  public abstract hashAlgorithmInMultihashCode: number;
  /** Multiplier on the per op fee */
  public abstract normalizedFeeToPerOperationFeeMultiplier: number;
  /** Value time lock amount multiplier */
  public abstract valueTimeLockAmountMultiplier: number;
}
