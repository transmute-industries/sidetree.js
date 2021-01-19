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

import {
  ErrorCode,
  OperationModel,
  OperationType,
  SidetreeError,
} from '@sidetree/common';
import CreateOperation from './CreateOperation';
import DeactivateOperation from './DeactivateOperation';
import RecoverOperation from './RecoverOperation';
import UpdateOperation from './UpdateOperation';

/**
 * A class that contains Sidetree operation utility methods.
 */
export default class Operation {
  /** Maximum allowed encoded reveal value string length. */
  public static readonly maxEncodedRevealValueLength = 50;

  /**
   * Parses the given buffer into an `OperationModel`.
   */
  public static async parse(operationBuffer: Buffer): Promise<OperationModel> {
    // Parse request buffer into a JS object.
    const operationJsonString = operationBuffer.toString();
    const operationObject = JSON.parse(operationJsonString);
    const operationType = operationObject.type;
    const isAnchorFileMode = false;

    if (operationType === OperationType.Create) {
      return CreateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Update) {
      return UpdateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Recover) {
      return RecoverOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else if (operationType === OperationType.Deactivate) {
      return DeactivateOperation.parseObject(
        operationObject,
        operationBuffer,
        isAnchorFileMode
      );
    } else {
      throw new SidetreeError(ErrorCode.OperationTypeUnknownOrMissing);
    }
  }
}
