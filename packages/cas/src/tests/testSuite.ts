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

import { ICasService, FetchResultCode } from '@sidetree/common';
import { didMethod } from '@sidetree/test-vectors';
import canonicalize from 'canonicalize';
import {
  testBuffer,
  testBufferHash,
  testString,
  testStringHash,
  notFoundHash,
} from './__fixtures__';

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
        expect(['mock', 'ipfs', 's3'].indexOf(serviceVersion.name)).not.toBe(
          -1
        );
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('Should provide an expected hash for a buffer', async () => {
        const expectedHash = await cas.write(testBuffer);
        expect(expectedHash).toBe(testBufferHash);
      });

      it('Should provide an expected hash for a string', async () => {
        const expectedHash = await cas.write(Buffer.from(testString));
        expect(expectedHash).toBe(testStringHash);
      });

      it('Should provide an expected hash for a delta object', async () => {
        const { delta } = didMethod.operations.create.operation;
        const expectedHash = await cas.write(Buffer.from(canonicalize(delta)!));
        const { deltaHash } = didMethod.operations.create.operation.suffixData;
        expect(expectedHash).toBe(deltaHash);
      });

      it('Should not match hash with incorrect JSON string', async () => {
        const { delta } = didMethod.operations.create.operation;
        const expectedHash = await cas.write(
          Buffer.from(JSON.stringify(delta)!)
        );
        const { deltaHash } = didMethod.operations.create.operation.suffixData;
        expect(expectedHash).not.toBe(deltaHash);
      });
    });

    describe('read', () => {
      it('Should Produce correct buffer from hash', async () => {
        const fetchResult = await cas.read(testBufferHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult!.content).toBe(testBuffer);
      });

      it('Should Produce correct string from hash', async () => {
        const fetchResult = await cas.read(testStringHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(fetchResult!.content?.toString()).toBe(testString);
      });

      it('Should produce correct delta object from hash', async () => {
        const { delta } = didMethod.operations.create.operation;
        const { deltaHash } = didMethod.operations.create.operation.suffixData;

        const fetchResult = await cas.read(deltaHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.Success);
        expect(JSON.parse(fetchResult.content!.toString())).toEqual(delta);
      });
      it('should return not found if hash does not exist', async () => {
        const fetchResult = await cas.read(notFoundHash, 0);
        expect(fetchResult.code).toEqual(FetchResultCode.NotFound);
      });
    });
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;