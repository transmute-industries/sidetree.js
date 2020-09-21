import crypto from 'crypto';
import { MockCas } from '@sidetree/cas';
import Compressor from '../util/Compressor';

import { sidetreeCoreGeneratedSecp256k1 } from '@sidetree/test-vectors';

it('getAddress', async () => {
  const rawBuffer = Buffer.from(
    JSON.stringify(
      sidetreeCoreGeneratedSecp256k1.filesystem.operation[0].chunkFile
    )
  );
  const compressedBuffer = await Compressor.compress(rawBuffer);

  const bufferHash = crypto
    .createHash('sha256')
    .update(compressedBuffer)
    .digest('hex');

  expect(bufferHash).toBe(
    'beb67135746771132652c514444ac78690168a29f8b9d90da9ccef8f50163af6'
  );
  const address = await MockCas.getAddress(compressedBuffer);
  expect(address).toEqual('QmTFXKvwYzhZjeKq1e222oyTPYmbkpyJsqtSQa7ZQZxUS5');
});
