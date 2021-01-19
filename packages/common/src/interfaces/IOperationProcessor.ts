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
import DidState from '../models/DidState';

/**
 * Interface that defines a class that can process operations.
 */
export default interface IOperationProcessor {
  /**
   * Applies an operation on top of the given DID state.
   * In the case of an invalid operation, the resultant DID state will remain the same.
   *
   * @param operation The operation to apply against the given DID Document (if any).
   * @param didState The DID state to apply the operation no top of. Needs to be `undefined` if the operation to be applied is a create operation.
   * @returns The resultant `DidState`.
   */
  apply(
    operation: AnchoredOperationModel,
    didState: DidState | undefined
  ): Promise<DidState | undefined>;

  /**
   * Gets the reveal value of a non-create operation.
   */
  getRevealValue(operation: AnchoredOperationModel): Promise<Buffer>;
}
