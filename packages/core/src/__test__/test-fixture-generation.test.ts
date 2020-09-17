import { generateKeyFixtures } from './generateKeyFixtures';
import { generateDidFixtures } from './generateDidFixtures';
import { generateFiles } from './generateFiles';

import { FileWriter } from './FileWriter';
const { sidetreeCoreGeneratedSecp256k1 } = require('@sidetree/test-vectors');

const WRITE_FIXTURES_TO_DISK = true;

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
  filesystem = await generateFiles(
    sidetreeCoreGeneratedSecp256k1.operation.operation[0].request
  );
});

it('compare and write files to disk', async () => {
  // expect(keypair).toEqual(sidetreeCoreGeneratedSecp256k1.keypair);
  // expect(operation).toEqual(sidetreeCoreGeneratedSecp256k1.operation);
  // expect(filesystem).toEqual(sidetreeCoreGeneratedSecp256k1.filesystem);
  if (WRITE_FIXTURES_TO_DISK) {
    FileWriter.write(`keypair.json`, JSON.stringify(keypair, null, 2));
    FileWriter.write('operation.json', JSON.stringify(operation, null, 2));
    FileWriter.write('filesystem.json', JSON.stringify(filesystem, null, 2));
  }
});
