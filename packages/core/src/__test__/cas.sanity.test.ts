/*
 * Copyright 2020 - Transmute Industries Inc.
 *
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
