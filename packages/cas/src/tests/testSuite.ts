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

import { ICasService } from '@sidetree/common';
import { didMethod } from '@sidetree/test-vectors';

const testSuite = (cas: ICasService): void => {
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
        expect(serviceVersion.name).toBeDefined(); // mock, ipfs, s3
        expect(serviceVersion.version).toBeDefined();
      });
    });

    describe('write', () => {
      it('Should Generate Id from buffer', async () => {
        // console.log(didMethod.operations.create);
        const { delta } = didMethod.operations.create.operation;
        console.log(delta);
        const { deltaHash } = didMethod.operations.create.operation.suffixData;
        console.log(deltaHash);
        const buff = Buffer.from(JSON.stringify(delta));
        console.log(buff);
        const expectedHash = await cas.write(
          Buffer.from(JSON.stringify(delta))
        );
        expect(expectedHash).toBe(deltaHash);
      });
    });

    describe('read', () => {
      it.todo('Should Produce correct buffer from Id');
    });
  });
};

// eslint-disable-next-line jest/no-export
export default testSuite;
