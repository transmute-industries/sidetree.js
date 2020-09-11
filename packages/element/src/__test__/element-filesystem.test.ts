import { MockCas } from '@sidetree/cas';
import { AnchorFile, ChunkFile, MapFile } from '@sidetree/core';
import Element from '../Element';

import { getTestElement } from '../test/utils';

import { generated } from '@sidetree/test-vectors';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

// move these tests to test-vector-conformance.spec.ts
it('create operation should generate expected chunk map and anchor files', async () => {
  const spy = jest.spyOn((element as any).cas, 'write');
  let spyCallCounter = 0;
  let chunkFileBuffer: Buffer;
  let mapFileBuffer: Buffer;
  let anchorFileBuffer: Buffer;
  spy.mockImplementation(async content => {
    const encodedHash = await MockCas.getAddress(content as Buffer);
    if (spyCallCounter === 0) {
      // Chunk file
      chunkFileBuffer = content as Buffer;
    } else if (spyCallCounter === 1) {
      // Map file
      mapFileBuffer = content as Buffer;
    } else if (spyCallCounter === 2) {
      // Anchor file
      anchorFileBuffer = content as Buffer;
    }
    spyCallCounter += 1;
    return encodedHash;
  });
  await element.handleOperationRequest(
    Buffer.from(JSON.stringify(generated.filesystem.operation[0].operation))
  );
  await element.triggerBatchWriting();

  const parsedChunkFile = await ChunkFile.parse(chunkFileBuffer!);
  expect(parsedChunkFile).toEqual(generated.filesystem.operation[0].chunkFile);
  const parsedMapFile = await MapFile.parse(mapFileBuffer!);
  expect(parsedMapFile).toEqual(generated.filesystem.operation[0].mapFile);
  const parsedAnchorFile = await AnchorFile.parse(anchorFileBuffer!);
  const jsonAnchorFile = parsedAnchorFile.model;
  expect(jsonAnchorFile).toEqual(generated.filesystem.operation[0].anchorFile);
});
