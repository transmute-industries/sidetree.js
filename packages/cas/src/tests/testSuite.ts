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
// import canonicalize from 'canonicalize';
import crypto from 'crypto';
import {
  testBuffer,
  testBufferHash,
  testBufferIpfs,
  testString,
  testStringHash,
  testStringIpfs,
  testObjectIpfs,
} from './__fixtures__';

let addr_a: string, addr_b: string, addr_c: string;

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
          ['mock', 'ipfs', 'ipfs-with-cache', 'cas-s3'].indexOf(
            serviceVersion.name
          )
        ).not.toBe(-1);
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('Should provide an expected hash for a buffer', async () => {
        const expectedHash = await cas.write(testBuffer);
        addr_a = expectedHash;
        expect([testBufferHash, testBufferIpfs].indexOf(expectedHash)).not.toBe(
          -1
        );
      });

      it('Should provide an expected hash for a string', async () => {
        const expectedHash = await cas.write(Buffer.from(testString));
        addr_b = expectedHash;
        expect([testStringHash, testStringIpfs].indexOf(expectedHash)).not.toBe(
          -1
        );
      });

      it('Should provide an expected hash for a delta object', async () => {
        const { delta } = didMethod.operations.create.operation;
        // const expectedHash = await cas.write(Buffer.from(canonicalize(delta)!));
        const expectedHash = await cas.write(
          JsonCanonicalizer.canonicalizeAsBuffer(delta)
        );
        addr_c = expectedHash;
        const { deltaHash } = didMethod.operations.create.operation.suffixData;
        expect([deltaHash, testObjectIpfs].indexOf(expectedHash)).not.toBe(-1);
      });

      it('Should not match hash with incorrect JSON string', async () => {
        const { delta } = didMethod.operations.create.operation;
        const expectedHash = await cas.write(
          Buffer.from(JSON.stringify(delta)!)
        );
        const { deltaHash } = didMethod.operations.create.operation.suffixData;
        expect([deltaHash, testObjectIpfs].indexOf(expectedHash)).toBe(-1);
      });
    });

    describe('read', () => {
      it('Should Produce correct buffer from hash', async () => {
        const fetchResult = await cas.read(addr_a, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(testBuffer.compare(fetchResult!.content as Buffer)).toBe(0);
      });

      it('Should Produce correct string from hash', async () => {
        const fetchResult = await cas.read(addr_b, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult!.content?.toString()).toBe(testString);
      });

      it('Should produce correct delta object from hash', async () => {
        const { delta } = didMethod.operations.create.operation;
        const fetchResult = await cas.read(addr_c, 0);
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
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
