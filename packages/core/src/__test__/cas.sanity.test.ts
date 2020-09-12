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
    'bc07c2585ac66dfef059c80a628eccdf8418e389647ad626251f03e0fd8887c2'
  );
  const address = await MockCas.getAddress(compressedBuffer);
  expect(address).toEqual('QmU2Lxsrcrcv8gJpwbttoXyusGWmh4YLcbTubKSZbc3ukj');
  // expect(address).toEqual(
  //   generated.filesystem.operation[0].mapFile.model.chunks[0].chunk_file_uri
  // );
});
