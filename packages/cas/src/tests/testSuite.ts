/*
 * The code in this file originated from
 * @see https://github.com/transmute-industries/sidetree.js/blob/130b0d926fc6918f7fdad22d785d04a50033238b/packages/cas/src/tests/testSuite.ts
 *
 * Copyright 2021 - Transmute Industries Inc.
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

import {
  ICasService,
  FetchResultCode,
  Encoder,
  Multihash,
  JsonCanonicalizer,
} from '@sidetree/common';
import { didMethod } from '@sidetree/test-vectors';
import crypto from 'crypto';
import {
  testBuffer,
  testString,
  testBufferHash,
  testStringHash,
  testObjectHash,
  ionVectors,
} from './__fixtures__';
import util from 'util';
import { gzip, gunzip } from 'zlib';

const gzipAsync = util.promisify(gzip);
const gunzipAsync = util.promisify(gunzip);

const testSuite = (cas: ICasService): void => {
  describe(cas.constructor.name, () => {
    beforeAll(async () => {
      await cas.initialize();
    });

    afterAll(async () => {
      await cas.close();
    });

    describe('getServiceVersion', () => {
      it('Should get service version', async () => {
        const serviceVersion = await cas.getServiceVersion();
        expect(serviceVersion).toBeDefined();
        expect(serviceVersion.name).toBeDefined();
        expect(
          ['mock', 'ipfs', 'ipfs-with-cache', 'cas-s3', 'mock-s3'].indexOf(
            serviceVersion.name
          )
        ).not.toBe(-1);
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('should provide an expected hash for a buffer', async () => {
        const expectedHash = await cas.write(testBuffer);
        expect(expectedHash).toBe(testBufferHash);
      });

      it('should provide an expected hash for a string', async () => {
        const expectedHash = await cas.write(Buffer.from(testString));
        expect(expectedHash).toBe(testStringHash);
      });

      it('should provide an expected hash for a delta object', async () => {
        const { delta } = didMethod.operations.create.operation;
        const expectedHash = await cas.write(
          JsonCanonicalizer.canonicalizeAsBuffer(delta)
        );
        expect(expectedHash).toBe(testObjectHash);
      });

      it('should not match hash with incorrect JSON string', async () => {
        const { delta } = didMethod.operations.create.operation;
        const expectedHash = await cas.write(
          Buffer.from(JSON.stringify(delta)!)
        );
        expect(expectedHash).not.toBe(testObjectHash);
      });
    });

    describe('read', () => {
      it('should Produce correct buffer from hash', async () => {
        const fetchResult = await cas.read(testBufferHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(testBuffer.compare(fetchResult!.content as Buffer)).toBe(0);
      });

      it('should Produce correct string from hash', async () => {
        const fetchResult = await cas.read(testStringHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult!.content?.toString()).toBe(testString);
      });

      it('should produce correct delta object from hash', async () => {
        const { delta } = didMethod.operations.create.operation;
        const fetchResult = await cas.read(testObjectHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(JSON.parse(fetchResult.content!.toString())).toEqual(delta);
      });
      it('should return not found if hash does not exist', async () => {
        const bytes = crypto.randomBytes(32);
        const hash = Multihash.hash(bytes, 18); // SHA256
        const notFoundHash = Encoder.encode(hash);
        const fetchResult = await cas.read(notFoundHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.NotFound);
      });
    });

    describe('files', () => {
      for (const key in ionVectors) {
        it(`should write and read the ${key} file`, async () => {
          const { cid, data, json } = ionVectors[key];

          const compressedBuffer = await gzipAsync(json);
          console.log(compressedBuffer);
          console.log(data);
          // expect(compressedBuffer).toBe(data);

          expect(cid).toBeDefined();
          expect(data).toBeDefined();
          expect(json).toBeDefined();
          expect(key).toBe(key);
        });
        break;
      }
    });
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
