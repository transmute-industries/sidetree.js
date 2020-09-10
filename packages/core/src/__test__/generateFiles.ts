import fs from 'fs';
import path from 'path';

import { AnchorFile, ChunkFile, MapFile, CreateOperation } from '../index';

import { MockCas } from '@sidetree/cas';
import { FileWriter } from './FileWriter';

export const generateFiles = async () => {
  const createOperation = await CreateOperation.parse(
    Buffer.from(
      fs
        .readFileSync(
          path.resolve(__dirname, './generated/createOperationBuffer.txt')
        )
        .toString(),
      'hex'
    )
  );
  // Generate create chunk file fixture
  const createChunkFileBuffer = await ChunkFile.createBuffer(
    [createOperation],
    [],
    []
  );
  const createChunkFile = await ChunkFile.parse(createChunkFileBuffer);
  const createChunkFileHash = await MockCas.getAddress(createChunkFileBuffer);
  FileWriter.write(
    'createChunkFile.json',
    JSON.stringify(createChunkFile, null, 2)
  );
  // Generate create map file fixture
  const createMapFileBuffer = await MapFile.createBuffer(
    createChunkFileHash,
    []
  );
  const createMapFile = await MapFile.parse(createMapFileBuffer);
  const createMapFileHash = await MockCas.getAddress(createMapFileBuffer);
  FileWriter.write(
    'createMapFile.json',
    JSON.stringify(createMapFile, null, 2)
  );
  // Generate create anchor file fixture
  const createAnchorFileBuffer = await AnchorFile.createBuffer(
    undefined,
    createMapFileHash,
    [createOperation],
    [],
    []
  );
  const createAnchorFile = await AnchorFile.parse(createAnchorFileBuffer);
  FileWriter.write(
    'createAnchorFile.json',
    JSON.stringify(createAnchorFile, null, 2)
  );
};
