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
  MapFileModel,
  Multihash,
  SidetreeError,
} from '@sidetree/common';
import Compressor from '../../util/Compressor';
import MapFile from '../../write/MapFile';
import OperationGenerator from '../generators/OperationGenerator';
import JasmineSidetreeErrorValidator from '../JasmineSidetreeErrorValidator';

describe('MapFile', () => {
  describe('parse()', () => {
    it('should throw if buffer given is not valid JSON.', async () => {
      const fileBuffer = Buffer.from('NotJsonString');
      const fileCompressed = await Compressor.compress(fileBuffer);

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => MapFile.parse(fileCompressed),
        ErrorCode.MapFileNotJson
      );
    });

    it('should throw if the buffer is not compressed', async () => {
      const mapFileModel: MapFileModel = {
        chunks: [
          { chunk_file_uri: 'EiB4ypIXxG9aFhXv2YC8I2tQvLEBbQAsNzHmph17vMfVYA' },
        ],
      };
      const fileBuffer = Buffer.from(JSON.stringify(mapFileModel));

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => MapFile.parse(fileBuffer),
        ErrorCode.MapFileDecompressionFailure
      );
    });

    it('should throw if has an unknown property.', async () => {
      const mapFile = {
        unknownProperty: 'Unknown property',
        ChunkFileHash: 'EiB4ypIXxG9aFhXv2YC8I2tQvLEBbQAsNzHmph17vMfVYA',
      };
      const fileBuffer = Buffer.from(JSON.stringify(mapFile));
      const fileCompressed = await Compressor.compress(fileBuffer);

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => MapFile.parse(fileCompressed),
        ErrorCode.MapFileHasUnknownProperty
      );
    });

    it('should throw if missing chunk file hash.', async () => {
      const mapFile = {
        // ChunkFileHash: 'EiB4ypIXxG9aFhXv2YC8I2tQvLEBbQAsNzHmph17vMfVYA', // Intentionally kept to show what the expected property should be.
      };
      const fileBuffer = Buffer.from(JSON.stringify(mapFile));
      const fileCompressed = await Compressor.compress(fileBuffer);

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => MapFile.parse(fileCompressed),
        ErrorCode.MapFileChunksPropertyMissingOrIncorrectType
      );
    });
  });

  describe('parseOperationsProperty()', () => {
    it('should throw if there is more than one (update) property.', async () => {
      const updateOperationData = await OperationGenerator.generateUpdateOperationRequest();
      const updateOperationRequest = updateOperationData.request;

      const operationsProperty = {
        update: [updateOperationRequest],
        unexpectedProperty: 'anyValue',
      };

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => (MapFile as any).parseOperationsProperty(operationsProperty),
        ErrorCode.MapFileOperationsPropertyHasMissingOrUnknownProperty
      );
    });

    it('should throw if there is update property is not an array.', async () => {
      const operationsProperty = {
        update: 'not an array',
      };

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => (MapFile as any).parseOperationsProperty(operationsProperty),
        ErrorCode.MapFileUpdateOperationsNotArray
      );
    });

    it('should throw if there are multiple update operations for the same DID.', async () => {
      const updateOperationData = await OperationGenerator.generateUpdateOperationRequest();
      const updateOperationRequest = updateOperationData.request;

      // Operation does not have `type` and `delta` property in map file.
      delete updateOperationRequest.type;
      delete updateOperationRequest.delta;

      const operationsProperty = {
        update: [
          updateOperationRequest,
          updateOperationRequest, // Intentionally having another update with the same DID.
        ],
      };

      await JasmineSidetreeErrorValidator.expectSidetreeErrorToBeThrownAsync(
        () => (MapFile as any).parseOperationsProperty(operationsProperty),
        ErrorCode.MapFileMultipleOperationsForTheSameDid
      );
    });
  });

  describe('validateChunksProperty()', () => {
    it('should throw if there is more than one chunk in chunks array.', async () => {
      const chunks = [
        {
          chunk_file_uri: Encoder.encode(
            Multihash.hash(Buffer.from('anyValue1'))
          ),
        },
        {
          chunk_file_uri: Encoder.encode(
            Multihash.hash(Buffer.from('anyValue2'))
          ),
        }, // Intentionally adding more than one element.
      ];

      expect(() => (MapFile as any).validateChunksProperty(chunks)).toThrow(
        new SidetreeError(
          ErrorCode.MapFileChunksPropertyDoesNotHaveExactlyOneElement
        )
      );
    });

    it('should throw if there is more than one property in a chunk element.', async () => {
      const chunks = [
        {
          chunk_file_uri: Encoder.encode(
            Multihash.hash(Buffer.from('anyValue1'))
          ),
          unexpectedProperty: 'any value',
        },
      ];

      expect(() => (MapFile as any).validateChunksProperty(chunks)).toThrow(
        new SidetreeError(ErrorCode.MapFileChunkHasMissingOrUnknownProperty)
      );
    });
  });
});
