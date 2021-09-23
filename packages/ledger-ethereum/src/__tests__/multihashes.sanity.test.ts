import { Encoder } from '@sidetree/common';

const anchorObject = {
  coreIndexFileUri: 'EiApWOZ-8Fe_8mba6FffZBVMA-gZZu3xjxDBmbiK4w3xTA',
  numberOfOperations: 1,
};

it('encode and decode bytes32', () => {
  const decoded = Encoder.decodeAsBuffer(anchorObject.coreIndexFileUri);
  const encoded = Encoder.encode(Buffer.from(decoded.toString('hex'), 'hex'));
  expect(encoded).toEqual(anchorObject.coreIndexFileUri);
});
