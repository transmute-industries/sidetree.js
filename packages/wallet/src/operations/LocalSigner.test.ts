import { LocalSigner } from './LocalSigner';

it('can sign with ES256K', async () => {
  const signer = LocalSigner.create(
    require('./__tests__/ion/vectors/inputs/jwkEs256k1Private.json')
  );
  const signature = await signer.sign({}, { hello: 'world' });
  expect(signature).toBe(
    'eyJhbGciOiJFUzI1NksifQ.eyJoZWxsbyI6IndvcmxkIn0.XTA_WHuM7Cr2YMfhMKZwJRA72mib28S-qbeTmdiNMeEychi7LUXahReDQyGo0wcvfvv9qr7sQ7Cn3zl9rRBG8w'
  );
});
