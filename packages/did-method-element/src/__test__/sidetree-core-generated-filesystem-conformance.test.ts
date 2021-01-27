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

import { MockCas } from '@sidetree/cas';
import { AnchorFile, ChunkFile, MapFile } from '@sidetree/core';
import Element from '../Element';
import { getTestElement } from '../test/utils';
import { sidetreeCoreGeneratedSecp256k1 } from '@sidetree/test-vectors';

console.info = (): null => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

jest.setTimeout(60 * 1000);

// move these tests to test-vector-conformance.spec.ts
it('create operation should generate expected chunk map and anchor files', async () => {
  const spy = jest.spyOn((element as any).cas, 'write');
  let spyCallCounter = 0;
  let chunkFileBuffer: Buffer;
  let mapFileBuffer: Buffer;
  let anchorFileBuffer: Buffer;
  spy.mockImplementation(async (content) => {
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
    Buffer.from(
      JSON.stringify(
        sidetreeCoreGeneratedSecp256k1.filesystem.operation[0].operation
      )
    )
  );
  await element.triggerBatchWriting();

  const parsedChunkFile = await ChunkFile.parse(chunkFileBuffer!);
  expect(parsedChunkFile).toEqual(
    sidetreeCoreGeneratedSecp256k1.filesystem.operation[0].chunkFile
  );
  const parsedMapFile = await MapFile.parse(mapFileBuffer!);
  expect(parsedMapFile).toEqual(
    sidetreeCoreGeneratedSecp256k1.filesystem.operation[0].mapFile
  );
  const parsedAnchorFile = await AnchorFile.parse(anchorFileBuffer!);
  const jsonAnchorFile = parsedAnchorFile.model;
  expect(jsonAnchorFile).toEqual(
    sidetreeCoreGeneratedSecp256k1.filesystem.operation[0].anchorFile
  );
});
