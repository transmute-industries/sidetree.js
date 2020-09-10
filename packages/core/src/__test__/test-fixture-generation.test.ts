import { generateKeyFixtures } from './generateKeyFixtures';
import { generateDidFixtures } from './generateDidFixtures';
import { generateFiles } from './generateFiles';

it('can generate key fixtures', async () => {
  await generateKeyFixtures();
});

it('can generate did fixtures', async () => {
  await generateDidFixtures();
});

it('can generate files', async () => {
  await generateFiles();
});
