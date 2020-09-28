/*
 * Copyright 2020 - Transmute Industries Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    fixtures.walletKeyPair.keypair[0].secp256k1.publicKeyJwk
  );
  expect(digest).toBe('EiACsZGLF2z30LcNJp3IagIMPGURQlZwbYH84kHqt-uC9A');
});

it('didUniqueSuffix from data', () => {
  const digest = sidetreeEncoding.hashThenEncode(
    base64url.toBuffer(
      fixtures.walletOperation.operation[0].createOperation.suffix_data
    )
  );
  expect(digest).toBe('EiA0qPvCoAuSLJS8l7DJ9CDrkTJlE4lEmub-SjDdNSn86A');
});
