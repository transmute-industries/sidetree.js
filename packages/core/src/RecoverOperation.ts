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
import OperationUtils from './OperationUtils';
import JsonAsync from './util/JsonAsync';
import Jwk from './util/Jwk';
import Jws from './util/Jws';

interface SignedDataModel {
  delta_hash: string;
  recovery_key: PublicKeyJwk;
  recovery_commitment: string;
}

/**
 * A class that represents a recover operation.
 */
export default class RecoverOperation implements OperationModel {
  /** The original request buffer sent by the requester. */
  public readonly operationBuffer: Buffer;

  /** The unique suffix of the DID. */
  public readonly didUniqueSuffix: string;

  /** The type of operation. */
  public readonly type: OperationType;

  /** Signed data. */
  public readonly signedDataJws: Jws;

  /** Encoded string of the delta. */
  public readonly encodedDelta: string | undefined;

  /** Decoded signed data payload. */
  public readonly signedData: SignedDataModel;

  /** Patch data. */
  public readonly delta: DeltaModel | undefined;

  /**
   * NOTE: should only be used by `parse()` and `parseObject()` else the constructed instance could be invalid.
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
    this.type = OperationType.Recover;
    this.didUniqueSuffix = didUniqueSuffix;
    this.signedDataJws = signedDataJws;
    this.signedData = signedData;
    this.encodedDelta = encodedDelta;
    this.delta = delta;
  }

  /**
   * Parses the given input as a recover operation entry in the anchor file.
   */
  public static async parseOperationFromAnchorFile(
    input: any
  ): Promise<RecoverOperation> {
    const operationBuffer = Buffer.from(JSON.stringify(input));
    const operation = await RecoverOperation.parseObject(
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
  ): Promise<RecoverOperation> {
    const operationJsonString = operationBuffer.toString();
    const operationObject = await JsonAsync.parse(operationJsonString);
    const recoverOperation = await RecoverOperation.parseObject(
      operationObject,
      operationBuffer,
      false
    );
    return recoverOperation;
  }

  /**
   * Parses the given operation object as a `RecoverOperation`.
   * The `operationBuffer` given is assumed to be valid and is assigned to the `operationBuffer` directly.
   * NOTE: This method is purely intended to be used as an optimization method over the `parse` method in that
   * JSON parsing is not required to be performed more than once when an operation buffer of an unknown operation type is given.
   * @param anchorFileMode If set to true, then `delta` and `type` properties are expected to be absent.
   */
  public static async parseObject(
    operationObject: any,
    operationBuffer: Buffer,
    anchorFileMode: boolean
  ): Promise<RecoverOperation> {
    let expectedPropertyCount = 4;
    if (anchorFileMode) {
      expectedPropertyCount = 2;
    }

    const properties = Object.keys(operationObject);
    if (properties.length !== expectedPropertyCount) {
      throw new SidetreeError(
        ErrorCode.RecoverOperationMissingOrUnknownProperty
      );
    }

    if (typeof operationObject.did_suffix !== 'string') {
      throw new SidetreeError(
        ErrorCode.RecoverOperationMissingOrInvalidDidUniqueSuffix
      );
    }

    const signedDataJws = Jws.parseCompactJws(operationObject.signed_data);
    const signedData = await RecoverOperation.parseSignedDataPayload(
      signedDataJws.payload
    );

    // If not in anchor file mode, we need to validate `type` and `delta` properties.
    let encodedDelta = undefined;
    let delta = undefined;
    if (!anchorFileMode) {
      if (operationObject.type !== OperationType.Recover) {
        throw new SidetreeError(ErrorCode.RecoverOperationTypeIncorrect);
      }

      encodedDelta = operationObject.delta;
      try {
        delta = await OperationUtils.parseDelta(operationObject.delta);
      } catch {
        // For compatibility with data pruning, we have to assume that delta may be unavailable,
        // thus an operation with invalid delta needs to be processed as an operation with unavailable delta,
        // so here we let delta be `undefined`.
      }
    }

    return new RecoverOperation(
      operationBuffer,
      operationObject.did_suffix,
      signedDataJws,
      signedData,
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

    // TODO: JSON Schema instead of property count type checking...
    if (properties.length !== 3) {
      throw new SidetreeError(
        ErrorCode.RecoverOperationSignedDataMissingOrUnknownProperty
      );
    }

    Jwk.validatePublicJwk(signedData.recovery_key);

    const delta_hash = Encoder.decodeAsBuffer(signedData.delta_hash);
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(delta_hash);

    const nextRecoveryCommitmentHash = Encoder.decodeAsBuffer(
      signedData.recovery_commitment
    );
    Multihash.verifyHashComputedUsingLatestSupportedAlgorithm(
      nextRecoveryCommitmentHash
    );

    return {
      delta_hash: signedData.delta_hash,
      recovery_key: signedData.recovery_key,
      recovery_commitment: signedData.recovery_commitment,
    };
  }
}
