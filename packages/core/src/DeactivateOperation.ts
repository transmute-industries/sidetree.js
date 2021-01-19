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
  Encoder,
  ErrorCode,
  PublicKeyJwk,
  OperationModel,
  OperationType,
  SidetreeError,
} from '@sidetree/common';
import JsonAsync from './util/JsonAsync';
import Jwk from './util/Jwk';
import Jws from './util/Jws';

interface SignedDataModel {
  didSuffix: string;
  recovery_key: PublicKeyJwk;
}

/**
 * A class that represents a deactivate operation.
 */
export default class DeactivateOperation implements OperationModel {
  /** The original request buffer sent by the requester. */
  public readonly operationBuffer: Buffer;

  /** The unique suffix of the DID. */
  public readonly didUniqueSuffix: string;

  /** The type of operation. */
  public readonly type: OperationType;

  /** Signed data. */
  public readonly signedDataJws: Jws;

  /** Decoded signed data payload. */
  public readonly signedData: SignedDataModel;

  /**
   * NOTE: should only be used by `parse()` and `parseObject()` else the contructed instance could be invalid.
   */
  private constructor(
    operationBuffer: Buffer,
    didUniqueSuffix: string,
    signedDataJws: Jws,
    signedData: SignedDataModel
  ) {
    this.operationBuffer = operationBuffer;
    this.type = OperationType.Deactivate;
    this.didUniqueSuffix = didUniqueSuffix;
    this.signedDataJws = signedDataJws;
    this.signedData = signedData;
  }

  /**
   * Parses the given input as a deactivate operation entry in the anchor file.
   */
  public static async parseOperationFromAnchorFile(
    input: any
  ): Promise<DeactivateOperation> {
    const operationBuffer = Buffer.from(JSON.stringify(input));
    const operation = await DeactivateOperation.parseObject(
      input,
      operationBuffer,
      true
    );
    return operation;
  }

  /**
   * Parses the given buffer as a `UpdateOperation`.
   */
  public static async parse(
    operationBuffer: Buffer
  ): Promise<DeactivateOperation> {
    const operationJsonString = operationBuffer.toString();
    const operationObject = await JsonAsync.parse(operationJsonString);
    const deactivateOperation = await DeactivateOperation.parseObject(
      operationObject,
      operationBuffer,
      false
    );
    return deactivateOperation;
  }

  /**
   * Parses the given operation object as a `DeactivateOperation`.
   * The `operationBuffer` given is assumed to be valid and is assigned to the `operationBuffer` directly.
   * NOTE: This method is purely intended to be used as an optimization method over the `parse` method in that
   * JSON parsing is not required to be performed more than once when an operation buffer of an unknown operation type is given.
   * @param anchorFileMode If set to true, then `type` is expected to be absent.
   */
  public static async parseObject(
    operationObject: any,
    operationBuffer: Buffer,
    anchorFileMode: boolean
  ): Promise<DeactivateOperation> {
    let expectedPropertyCount = 3;
    if (anchorFileMode) {
      expectedPropertyCount = 2;
    }

    const properties = Object.keys(operationObject);
    if (properties.length !== expectedPropertyCount) {
      throw new SidetreeError(
        ErrorCode.DeactivateOperationMissingOrUnknownProperty
      );
    }

    if (typeof operationObject.did_suffix !== 'string') {
      throw new SidetreeError(
        ErrorCode.DeactivateOperationMissingOrInvalidDidUniqueSuffix
      );
    }

    const signedDataJws = Jws.parseCompactJws(operationObject.signed_data);
    const signedData = await DeactivateOperation.parseSignedDataPayload(
      signedDataJws.payload,
      operationObject.did_suffix
    );

    // If not in anchor file mode, we need to validate `type` property.
    if (!anchorFileMode) {
      if (operationObject.type !== OperationType.Deactivate) {
        throw new SidetreeError(ErrorCode.DeactivateOperationTypeIncorrect);
      }
    }

    return new DeactivateOperation(
      operationBuffer,
      operationObject.did_suffix,
      signedDataJws,
      signedData
    );
  }

  private static async parseSignedDataPayload(
    deltaEncodedString: string,
    expectedDidUniqueSuffix: string
  ): Promise<SignedDataModel> {
    const signedDataJsonString = Encoder.decodeAsString(deltaEncodedString);
    const signedData = await JsonAsync.parse(signedDataJsonString);

    const properties = Object.keys(signedData);
    if (properties.length !== 2) {
      throw new SidetreeError(
        ErrorCode.DeactivateOperationSignedDataMissingOrUnknownProperty
      );
    }

    if (signedData.did_suffix !== expectedDidUniqueSuffix) {
      throw new SidetreeError(
        ErrorCode.DeactivateOperationSignedDidUniqueSuffixMismatch
      );
    }

    Jwk.validatePublicJwk(signedData.recovery_key);

    return {
      didSuffix: signedData.did_suffix,
      recovery_key: signedData.recovery_key,
    };
  }
}
