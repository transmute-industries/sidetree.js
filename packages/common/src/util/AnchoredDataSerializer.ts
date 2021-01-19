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

import { AnchoredData } from '../models';
import { ErrorCode, SidetreeError } from '../errors';
import protocolParameters from './parameters';

/**
 * Encapsulates functionality to serialize/deserialize data that read/write to
 * the blockchain.
 */
export default class AnchoredDataSerializer {
  /** Delimiter between logical parts in anchor string. */
  public static readonly delimiter = '.';

  /**
   * Converts the given inputs to the string that is to be written to the blockchain.
   *
   * @param dataToBeAnchored The data to serialize.
   */
  public static serialize(dataToBeAnchored: AnchoredData): string {
    // Concatenate the inputs w/ the delimiter and return
    const anchorString = `${dataToBeAnchored.numberOfOperations}${AnchoredDataSerializer.delimiter}${dataToBeAnchored.anchorFileHash}`;
    return anchorString;
  }

  /**
   * Deserializes the given string that is read from the blockchain into data.
   *
   * @param serializedData The data to be deserialized.
   */
  public static deserialize(serializedData: string): AnchoredData {
    const splitData = serializedData.split(AnchoredDataSerializer.delimiter);

    if (splitData.length !== 2) {
      throw new SidetreeError(
        ErrorCode.AnchoredDataIncorrectFormat,
        `Input is not in correct format: ${serializedData}`
      );
    }

    const numberOfOperations = AnchoredDataSerializer.parsePositiveInteger(
      splitData[0]
    );

    if (numberOfOperations > protocolParameters.maxOperationsPerBatch) {
      throw new SidetreeError(
        ErrorCode.AnchoredDataNumberOfOperationsGreaterThanMax,
        `Number of operations ${numberOfOperations} must be less than or equal to ${protocolParameters.maxOperationsPerBatch}`
      );
    }

    return {
      anchorFileHash: splitData[1],
      numberOfOperations: numberOfOperations,
    };
  }

  private static parsePositiveInteger(input: string): number {
    // NOTE:
    // /<expression>/ denotes regex.
    // ^ denotes beginning of string.
    // $ denotes end of string.
    // [1-9] denotes leading '0' not allowed.
    // \d* denotes followed by 0 or more decimal digits.
    const isPositiveInteger = /^[1-9]\d*$/.test(input);

    if (!isPositiveInteger) {
      throw new SidetreeError(
        ErrorCode.AnchoredDataNumberOfOperationsNotPositiveInteger,
        `Number of operations '${input}' is not a positive integer without leading zeros.`
      );
    }

    return Number(input);
  }
}
