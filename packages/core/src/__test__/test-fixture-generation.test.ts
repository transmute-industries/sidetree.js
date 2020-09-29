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

import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';
import { generateKeyFixtures } from './generateKeyFixtures';
import { generateDidFixtures } from './generateDidFixtures';
import { generateFiles } from './generateFiles';

import { FileWriter } from './FileWriter';

const WRITE_FIXTURES_TO_DISK = false;

let keypair: any;
let operation: any;
let filesystem: any;

it('can generate key fixtures', async () => {
  keypair = await generateKeyFixtures();
});

it('can generate did fixtures', async () => {
  operation = await generateDidFixtures();
});

it('can generate files', async () => {
  filesystem = await generateFiles(operation.operation[0].request);
});

it('compare and write files to disk', async () => {
  expect(keypair).toEqual(sidetreeCoreGeneratedEd25519.keypair);
  expect(operation).toEqual(sidetreeCoreGeneratedEd25519.operation);
  expect(filesystem).toEqual(sidetreeCoreGeneratedEd25519.filesystem);
  if (WRITE_FIXTURES_TO_DISK) {
    FileWriter.write(`keypair.json`, JSON.stringify(keypair, null, 2));
    FileWriter.write('operation.json', JSON.stringify(operation, null, 2));
    FileWriter.write('filesystem.json', JSON.stringify(filesystem, null, 2));
  }
});
