/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
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

import { FetchResultCode, ICas } from '@sidetree/common';
import {
  testObj,
  testObjMultihash,
  testString,
  testStringMultiHash,
  testInteger,
  testIntegerMultiHash,
  testBuffer,
  testBufferMultihash,
  notFoundMultihash,
} from './__fixtures__';

const testSuite = (cas: ICas): void => {
  describe(cas.constructor.name, () => {
    beforeAll(async () => {
      await cas.initialize();
    });

    afterAll(async () => {
      await cas.close();
    });

    describe('getServiceVersion', () => {
      it('should get service version', async () => {
        const serviceVersion = await cas.getServiceVersion();
        expect(serviceVersion).toBeDefined();
        expect(serviceVersion.name).toBeDefined();
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('should write a JSON and return content id', async () => {
        const cid = await cas.write(Buffer.from(JSON.stringify(testObj)));
        expect(cid).toBe(testObjMultihash);
      });

      it('should write a string and return content id', async () => {
        const cid = await cas.write(Buffer.from(testString));
        expect(cid).toBe(testStringMultiHash);
      });

      it('should write an integer and return content id', async () => {
        const cid = await cas.write(Buffer.from(testInteger.toString()));
        expect(cid).toBe(testIntegerMultiHash);
      });

      it('should write a buffer and return content id', async () => {
        const cid = await cas.write(testBuffer);
        expect(cid).toBe(testBufferMultihash);
      });
    });

    describe('read', () => {
      it('should read a JSON', async () => {
        const fetchResult = await cas.read(testObjMultihash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(JSON.parse(fetchResult.content!.toString())).toEqual(testObj);
      });

      it('should read a string', async () => {
        const fetchResult = await cas.read(testStringMultiHash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult.content!.toString()).toEqual(testString);
      });

      it('should read an integer', async () => {
        const fetchResult = await cas.read(testIntegerMultiHash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(Number.parseInt(fetchResult.content!.toString())).toEqual(
          testInteger
        );
      });

      it('should read a buffer', async () => {
        const fetchResult = await cas.read(testBufferMultihash);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult.content).toEqual(testBuffer);
      });

      it('should return not found if cid does not exist', async () => {
        const fetchResult = await cas.read(notFoundMultihash);
        expect(fetchResult.code).toEqual(FetchResultCode.NotFound);
      });
    });
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
