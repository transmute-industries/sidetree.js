import { MockCas } from '@sidetree/cas';
import Compressor from '../util/Compressor';

import { generated } from '@sidetree/test-vectors';

it('getAddress', async () => {
  const address = await MockCas.getAddress(
    await Compressor.compress(
      Buffer.from(JSON.stringify(generated.filesystem.operation[0].chunkFile))
    )
  );
  expect(address).toEqual(
    generated.filesystem.operation[0].mapFile.model.chunks[0].chunk_file_uri
  );
});
