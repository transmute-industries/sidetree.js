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

  let filesystem = {
    operation: [
      {
        operation: createOperationRequest,
        chunkFile: createChunkFile,
        mapFile: createMapFile,
        anchorFile: createAnchorFile.model,
      },
    ],
  };

  return filesystem;
};
