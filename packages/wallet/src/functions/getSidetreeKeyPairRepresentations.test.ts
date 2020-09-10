import { getSidetreeKeyPairRepresentations } from './getSidetreeKeyPairRepresentations';
import { keypair_1, sidetree } from '../__fixtures__';
it('can get sidetree key pair from wallet key pair', async () => {
  const key = await getSidetreeKeyPairRepresentations(keypair_1);
  expect(key).toEqual(sidetree.keypair_0);
});
