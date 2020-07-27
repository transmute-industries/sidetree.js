import { MockCas } from '@sidetree/cas';
import { AnchorFile, ChunkFile, MapFile } from '@sidetree/core';
import Element from '../Element';
import {
  createChunkFile,
  createMapFile,
  createAnchorFile,
  createOperationBuffer,
} from './__fixtures__';
import { getTestElement } from './utils';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

it('should generate valid files', async done => {
  expect.assertions(3);
  const spy = jest.spyOn((element as any).cas, 'write');
  let spyCallCounter = 0;
  spy.mockImplementation(async content => {
    const encodedHash = await MockCas.getAddress(content as Buffer);
    if (spyCallCounter === 0) {
      // Chunk file
      const parsedChunkFile = await ChunkFile.parse(content as Buffer);
      expect(parsedChunkFile).toEqual(createChunkFile);
    } else if (spyCallCounter === 1) {
      // Map file
      const parsedMapFile = await MapFile.parse(content as Buffer);
      expect(parsedMapFile).toEqual(createMapFile);
    } else if (spyCallCounter === 2) {
      // Anchor file
      const parsedAnchorFile = await AnchorFile.parse(content as Buffer);
      const jsonAnchorFile = JSON.parse(JSON.stringify(parsedAnchorFile));
      expect(jsonAnchorFile).toEqual(createAnchorFile);
      done();
    }
    spyCallCounter += 1;
    return encodedHash;
  });
  await element.handleOperationRequest(createOperationBuffer);
  await element.triggerBatchWriting();
});
