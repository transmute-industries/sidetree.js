import { generateKeyFixtures } from './generateKeyFixtures';
import { generateDidFixtures } from './generateDidFixtures';
import { generateFiles } from './generateFiles';

import { FileWriter } from './FileWriter';
import {
  keypair as keypairFixture,
  operation as operationFixture,
  filesystem as filesystemFixture,
} from './generated';

process.env.WRITE_FIXTURES_TO_DISK = 'YES';

let keypair: any;
let operation: any;
let filesystem: any;

it('can generate key fixtures', async () => {
  keypair = await generateKeyFixtures();
  expect(keypair).toEqual(keypairFixture);
});

it('can generate did fixtures', async () => {
  operation = await generateDidFixtures();
  expect(operation).toEqual(operationFixture);
});

it('can generate files', async () => {
  filesystem = await generateFiles(operation.operation[0].request);
  expect(filesystem).toEqual(filesystemFixture);
});

it('can write files to disk', async () => {
  if (process.env.WRITE_FIXTURES_TO_DISK === 'YES') {
    FileWriter.write(`keypair.json`, JSON.stringify(keypair, null, 2));
    FileWriter.write('operation.json', JSON.stringify(operation, null, 2));
    FileWriter.write('filesystem.json', JSON.stringify(filesystem, null, 2));
  }
});
