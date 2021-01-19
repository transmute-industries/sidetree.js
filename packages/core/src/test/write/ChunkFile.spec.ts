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

import { Encoder, ErrorCode } from '@sidetree/common';
import * as crypto from 'crypto';
import Compressor from '../../util/Compressor';
import Jwk from '../../util/Jwk';
import ChunkFile from '../../write/ChunkFile';
import OperationGenerator from '../generators/OperationGenerator';
import JasmineSidetreeErrorValidator from '../JasmineSidetreeErrorValidator';

describe('ChunkFile', () => {
  describe('parse()', () => {
    it('should throw exception if there is an unknown property.', async () => {
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const createOperation = createOperationData.createOperation;

      const chunkFileModel = {
        deltas: [createOperation.encodedDelta],
        unexpectedProperty: 'any value',
      };

      const rawData = Buffer.from(JSON.stringify(chunkFileModel));
      const compressedRawData = await Compressor.compress(Buffer.from(rawData));

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => ChunkFile.parse(compressedRawData),
        ErrorCode.ChunkFileUnexpectedProperty
      );
    });
  });

  describe('createBuffer()', () => {
    it('should create the buffer correctly.', async () => {
      const createOperationData = await OperationGenerator.generateCreateOperation();
      const createOperation = createOperationData.createOperation;

      const [, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();
      const recoverOperationData = await OperationGenerator.generateRecoverOperation(
        {
          didUniqueSuffix: 'didOfRecovery',
          recoveryPrivateKey,
        }
      );
      const recoverOperation = recoverOperationData.recoverOperation;

      const chunkFileBuffer = await ChunkFile.createBuffer(
        [createOperation],
        [recoverOperation],
        []
      );

      const decompressedChunkFileModel = await ChunkFile.parse(chunkFileBuffer);

      expect(decompressedChunkFileModel.deltas.length).toEqual(2);
      expect(decompressedChunkFileModel.deltas[0]).toEqual(
        createOperation.encodedDelta!
      );
      expect(decompressedChunkFileModel.deltas[1]).toEqual(
        recoverOperation.encodedDelta!
      );
    });
  });

  describe('validateDeltasProperty()', () => {
    it('should throw is `delta` property is not an array.', async () => {
      const deltas = 'Incorrect type.';

      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => (ChunkFile as any).validateDeltasProperty(deltas),
        ErrorCode.ChunkFileDeltasPropertyNotArray
      );
    });

    it('should throw if any `delta` element is not a string.', async () => {
      const deltas = [
        1,
        2,
        3, // Intentionally incorrect type.
      ];

      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => (ChunkFile as any).validateDeltasProperty(deltas),
        ErrorCode.ChunkFileDeltasNotArrayOfStrings
      );
    });

    it('should throw with random `delta` elements.', async () => {
      const randomBytes = crypto.randomBytes(2000); // Intentionally larger than maximum.
      const deltas = [Encoder.encode(randomBytes)];

      JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrown(
        () => (ChunkFile as any).validateDeltasProperty(deltas),
        ErrorCode.ChunkFileDeltaSizeExceedsLimit
      );
    });
  });
});
