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
  DeltaModel,
  Encoder,
  ErrorCode,
  PublicKeyJwk,
  Multihash,
  OperationModel,
  OperationType,
  SidetreeError,
} from '@sidetree/common';
import JsonAsync from './util/JsonAsync';
import Jwk from './util/Jwk';
import Jws from './util/Jws';
import OperationUtils from './OperationUtils';

interface SignedDataModel {
  delta_hash: string;
  update_key: PublicKeyJwk;
}

/**
 * A class that represents an update operation.
 */
export default class UpdateOperation implements OperationModel {
  /** The original request buffer sent by the requester. */
  public readonly operationBuffer: Buffer;

  /** The unique suffix of the DID. */
  public readonly didUniqueSuffix: string;

  /** The type of operation. */
  public readonly type: OperationType;

  /** Signed data for the operation. */
  public readonly signedDataJws: Jws;

  /** Decoded signed data payload. */
  public readonly signedData: SignedDataModel;

  /** Patch data. */
  public readonly delta: DeltaModel | undefined;

  /** Encoded string of the delta. */
  public readonly encodedDelta: string | undefined;

  /**
   * NOTE: should only be used by `parse()` and `parseObject()` else the contructed instance could be invalid.
   */
  private constructor(
    operationBuffer: Buffer,
    didUniqueSuffix: string,
    signedDataJws: Jws,
    signedData: SignedDataModel,
    encodedDelta: string | undefined,
    delta: DeltaModel | undefined
  ) {
    this.operationBuffer = operationBuffer;
    this.type = OperationType.Update;
    this.didUniqueSuffix = didUniqueSuffix;
    this.signedDataJws = signedDataJws;
    this.signedData = signedData;
    this.encodedDelta = encodedDelta;
    this.delta = delta;
  }

  /**
   * Parses the given input as an update operation entry in the map file.
   */
  public static async parseOperationFromMapFile(
    input: any
  ): Promise<UpdateOperation> {
    const operationBuffer = Buffer.from(JSON.stringify(input));
    const operation = await UpdateOperation.parseObject(
      input,
      operationBuffer,
      true
    );
    return operation;
  }

  /**
   * Parses the given buffer as a `UpdateOperation`.
   */
  public static async parse(operationBuffer: Buffer): Promise<UpdateOperation> {
    const operationJsonString = operationBuffer.toString();
    const operationObject = await JsonAsync.parse(operationJsonString);
    const updateOperation = await UpdateOperation.parseObject(
      operationObject,
      operationBuffer,
      false
    );
    return updateOperation;
  }

  /**
   * Parses the given operation object as a `UpdateOperation`.
   * The `operationBuffer` given is assumed to be valid and is assigned to the `operationBuffer` directly.
   * NOTE: This method is purely intended to be used as an optimization method over the `parse` method in that
   * JSON parsing is not required to be performed more than once when an operation buffer of an unknown operation type is given.
   * @param mapFileMode If set to true, then `delta` and `type` properties are expected to be absent.
   */
  public static async parseObject(
    operationObject: any,
    operationBuffer: Buffer,
    mapFileMode: boolean
  ): Promise<UpdateOperation> {
    let expectedPropertyCount = 4;
    if (mapFileMode) {
      expectedPropertyCount = 2;
    }

    const properties = Object.keys(operationObject);
    if (properties.length !== expectedPropertyCount) {
      throw new SidetreeError(
        ErrorCode.UpdateOperationMissingOrUnknownProperty
      );
    }

    if (typeof operationObject.did_suffix !== 'string') {
      throw new SidetreeError(ErrorCode.UpdateOperationMissingDidUniqueSuffix);
    }

    const signedData = Jws.parseCompactJws(operationObject.signed_data);
    const signedDataModel = await UpdateOperation.parseSignedDataPayload(
      signedData.payload
    );

    // If not in map file mode, we need to validate `type` and `delta` properties.
    let encodedDelta = undefined;
    let delta = undefined;
    if (!mapFileMode) {
      if (operationObject.type !== OperationType.Update) {
        throw new SidetreeError(ErrorCode.UpdateOperationTypeIncorrect);
      }

      encodedDelta = operationObject.delta;
      delta = await OperationUtils.parseDelta(encodedDelta);
    }

    return new UpdateOperation(
      operationBuffer,
      operationObject.did_suffix,
      signedData,
      signedDataModel,
      encodedDelta,
      delta
    );
  }

  private static async parseSignedDataPayload(
    signedDataEncodedString: string
  ): Promise<SignedDataModel> {
    const signedDataJsonString = Encoder.decodeAsString(
      signedDataEncodedString
    );
    const signedData = await JsonAsync.parse(signedDataJsonString);

    const properties = Object.keys(signedData);
    if (properties.length !== 2) {
      throw new SidetreeError(
        ErrorCode.UpdateOperationSignedDataHasMissingOrUnknownProperty
      );
    }

    Jwk.validatePublicJwk(signedData.update_key);

    const delta_hash = Encoder.decodeAsBuffer(signedData.delta_hash);
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(delta_hash);

    return {
      delta_hash: signedData.delta_hash,
      update_key: signedData.update_key,
    };
  }
}
