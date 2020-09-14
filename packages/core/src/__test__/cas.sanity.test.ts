import crypto from 'crypto';
import { MockCas } from '@sidetree/cas';
import Compressor from '../util/Compressor';

import { generated } from '@sidetree/test-vectors';

it('getAddress', async () => {
  const rawBuffer = Buffer.from(
    JSON.stringify(generated.filesystem.operation[0].chunkFile)
  );
  const compressedBuffer = await Compressor.compress(rawBuffer);

  const bufferHash = crypto
    .createHash('sha256')
    .update(compressedBuffer)
    .digest('hex');

  expect(bufferHash).toBe(
    '587779ff401f6a67a90e941a8532071fd888cdc944f7a297b89bdc3ba6eaa0f1'
  );
  const address = await MockCas.getAddress(compressedBuffer);
  expect(address).toEqual('QmPd5Wk65qPgXFJixTpCYiKEQ87HmUH6uuQnCpiVUGSSgg');
  // expect(address).toEqual(
  //   generated.filesystem.operation[0].mapFile.model.chunks[0].chunk_file_uri
  // );
});
