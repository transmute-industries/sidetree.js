import { generateKeyFixtures } from './generateKeyFixtures';
import { generateDidFixtures } from './generateDidFixtures';
import { generateFiles } from './generateFiles';

import { FileWriter } from './FileWriter';
const { generated } = require('@sidetree/test-vectors');

process.env.WRITE_FIXTURES_TO_DISK = 'NO';

let keypair: any;
let operation: any;
let filesystem: any;

it('can generate key fixtures', async () => {
  keypair = await generateKeyFixtures();
  expect(keypair).toEqual(generated.keypair);
});

it('can generate did fixtures', async () => {
  operation = await generateDidFixtures();
  expect(operation).toEqual(generated.operation);
});

it('can generate files', async () => {
  filesystem = await generateFiles(operation.operation[0].request);
  expect(filesystem).toEqual(generated.filesystem);
});

it('can write files to disk', async () => {
  if (process.env.WRITE_FIXTURES_TO_DISK === 'YES') {
    FileWriter.write(`keypair.json`, JSON.stringify(keypair, null, 2));
    FileWriter.write('operation.json', JSON.stringify(operation, null, 2));
    FileWriter.write('filesystem.json', JSON.stringify(filesystem, null, 2));
  }
});
