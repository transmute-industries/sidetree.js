import * as fixtures from '../__fixtures__';

import * as sidetreeEncoding from './sidetreeEncoding';
import base64url from 'base64url';

it('sha256', () => {
  const digest = sidetreeEncoding.sha256(Buffer.from('hello world'));
  expect(digest.toString('hex')).toBe(
    'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
  );
});

it('hashThenEncode', () => {
  const digest = sidetreeEncoding.hashThenEncode(Buffer.from('hello world'));
  expect(digest).toBe('EiC5TSe5k00-CKUuUtfafav6xITv43pTgO6QiPes4u_N6Q');
});

it('canonicalizeThenHashThenEncode', () => {
  const digest = sidetreeEncoding.canonicalizeThenHashThenEncode(
    fixtures.sidetree_data_model_fixtures.keypair_0.publicKeyJwk
  );
  expect(digest).toBe(
    fixtures.sidetree_data_model_fixtures.keypair_0_commitment
  );
});

it.only('didUniqueSuffix from data', () => {
  const digest = sidetreeEncoding.hashThenEncode(
    base64url.toBuffer(
      fixtures.sidetree_data_model_fixtures.keypair_0_create_operation
        .suffix_data
    )
  );
  expect(digest).toBe('EiC1JOpBitKv4JS59njU7P_Y-0a6IisowgGJ1pwUKaV7wg');
});
