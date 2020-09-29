/*
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

import { AnchorFile, ChunkFile, MapFile, CreateOperation } from '../index';

import { MockCas } from '@sidetree/cas';

export const generateFiles = async (createOperationRequest: any) => {
  const createOperation = await CreateOperation.parse(
    Buffer.from(JSON.stringify(createOperationRequest))
  );

  // Generate create chunk file fixture
  const createChunkFileBuffer = await ChunkFile.createBuffer(
    [createOperation],
    [],
    []
  );
  const createChunkFile = await ChunkFile.parse(createChunkFileBuffer);
  const createChunkFileHash = await MockCas.getAddress(createChunkFileBuffer);

  // Generate create map file fixture
  const createMapFileBuffer = await MapFile.createBuffer(
    createChunkFileHash,
    []
  );
  const createMapFile = await MapFile.parse(createMapFileBuffer);
  const createMapFileHash = await MockCas.getAddress(createMapFileBuffer);

  // Generate create anchor file fixture
  const createAnchorFileBuffer = await AnchorFile.createBuffer(
    undefined,
    createMapFileHash,
    [createOperation],
    [],
    []
  );
  const createAnchorFile = await AnchorFile.parse(createAnchorFileBuffer);

  const filesystem = {
    operation: [
      {
        operation: createOperationRequest,
        chunkFile: createChunkFile,
        mapFile: createMapFile,
        anchorFile: createAnchorFile.model,
      },
    ],
  };

  return JSON.parse(JSON.stringify(filesystem));
};
