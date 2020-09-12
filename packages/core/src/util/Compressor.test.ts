import Compressor from './Compressor';

const expectedCompressed = '789c3334320600012d0097';

it('compress', async () => {
  const buffer = Buffer.from('123');
  const bufferCompressed = await Compressor.compress(buffer);
  expect(bufferCompressed.toString('hex')).toEqual(expectedCompressed);
});

it('decompress', async () => {
  const bufferDecompressed = await Compressor.decompress(
    Buffer.from(expectedCompressed, 'hex')
  );
  expect(bufferDecompressed.toString()).toEqual('123');
});
