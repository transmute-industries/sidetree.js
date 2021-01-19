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
  ChunkFileModel,
  ErrorCode,
  SidetreeError,
  protocolParameters,
} from '@sidetree/common';
import timeSpan from 'time-span';
import CreateOperation from '../CreateOperation';
import RecoverOperation from '../RecoverOperation';
import UpdateOperation from '../UpdateOperation';
import Compressor from '../util/Compressor';
import JsonAsync from '../util/JsonAsync';

/**
 * Defines schema of a Chunk File and its related operations.
 * NOTE: Must NOT add properties not defined by Sidetree protocol.
 */
export default class ChunkFile {
  /**
   * Parses and validates the given chunk file buffer and all the operations within it.
   * @throws SidetreeError if failed parsing or validation.
   */
  public static async parse(chunkFileBuffer: Buffer): Promise<ChunkFileModel> {
    const endTimer = timeSpan();
    const decompressedChunkFileBuffer = await Compressor.decompress(
      chunkFileBuffer
    );
    const chunkFileObject = await JsonAsync.parse(decompressedChunkFileBuffer);
    console.info(`Parsed chunk file in ${endTimer.rounded()} ms.`);

    // Ensure only properties specified by Sidetree protocol are given.
    const allowedProperties = new Set(['deltas']);
    for (const property in chunkFileObject) {
      if (!allowedProperties.has(property)) {
        throw new SidetreeError(
          ErrorCode.ChunkFileUnexpectedProperty,
          `Unexpected property ${property} in chunk file.`
        );
      }
    }

    this.validateDeltasProperty(chunkFileObject.deltas);

    return chunkFileObject;
  }

  private static validateDeltasProperty(deltas: any) {
    // Make sure deltas is an array.
    if (!(deltas instanceof Array)) {
      throw new SidetreeError(
        ErrorCode.ChunkFileDeltasPropertyNotArray,
        'Invalid chunk file, deltas property is not an array.'
      );
    }

    // Validate every encoded delta string.
    for (const encodedDelta of deltas) {
      if (typeof encodedDelta !== 'string') {
        throw new SidetreeError(
          ErrorCode.ChunkFileDeltasNotArrayOfStrings,
          'Invalid chunk file, deltas property is not an array of strings.'
        );
      }

      const deltaBuffer = Buffer.from(encodedDelta);

      // Verify size of each delta does not exceed the maximum allowed limit.
      if (deltaBuffer.length > protocolParameters.maxDeltaSizeInBytes) {
        throw new SidetreeError(
          ErrorCode.ChunkFileDeltaSizeExceedsLimit,
          `Operation size of ${deltaBuffer.length} bytes exceeds the allowed limit of ${protocolParameters.maxDeltaSizeInBytes} bytes.`
        );
      }
    }
  }

  /**
   * Creates chunk file buffer.
   */
  public static async createBuffer(
    createOperations: CreateOperation[],
    recoverOperations: RecoverOperation[],
    updateOperations: UpdateOperation[]
  ) {
    const deltas = [];
    deltas.push(
      ...createOperations.map((operation) => operation.encodedDelta!)
    );
    deltas.push(
      ...recoverOperations.map((operation) => operation.encodedDelta!)
    );
    deltas.push(
      ...updateOperations.map((operation) => operation.encodedDelta!)
    );

    const chunkFileModel = {
      deltas,
    };

    const rawData = Buffer.from(JSON.stringify(chunkFileModel));
    const compressedRawData = await Compressor.compress(Buffer.from(rawData));

    return compressedRawData;
  }
}
