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

import vectors from '@sidetree/test-vectors';
import Element from '../../Element';
import { getTestElement, resetDatabase } from '../../test/utils';

import { longFormResolutionResponse } from './__fixtures__';

import { SidetreeWalletPlugin } from '@sidetree/wallet';

let element: Element;

// const WRITE_FIXTURE_TO_DISK = false;

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

jest.setTimeout(60 * 1000);

const wallet = SidetreeWalletPlugin.build();

const uniqueSuffix = 'EiD351yY0XqnbCJN2MaZSQJMgG-bqmgFMDRGKawfu6_mZA';
const longFormDid = `did:elem:ropsten:${uniqueSuffix}:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJ6UTNzaFNWVzR6SHRIZXVXRk1SVkRTRVAyaWpxdk5hMktVMnlISHNXVEYyTWc0ZkNOIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6IlMzOTRjdXRBd0ljRHNmUGJEOWxOUk1oTEZWWUI0b3VUVHhwZ21uanRYNU0iLCJ5IjoiR01sUmJlck96SnI1UFBHU3luRnU2TWlIeFRpdEk0R2hmOVFLcUw4ZkNPUSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCIsImtleUFncmVlbWVudCJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifV0sInNlcnZpY2VzIjpbeyJpZCI6ImV4YW1wbGUtc2VydmljZSIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJ0eXBlIjoiRXhhbXBsZVNlcnZpY2UifV19fV0sInVwZGF0ZUNvbW1pdG1lbnQiOiJFaUJNQWpTQV9BSmFzcDZDMmcwbTRxeVRFZzVJUlVBV1JsV1EzdlVfWGpDMWhRIn0sInN1ZmZpeERhdGEiOnsiZGVsdGFIYXNoIjoiRWlESjExRlByeUZfVlF0ajFYemJETXBCNklXR0FRcGtvRzdYVlNlZl85UWFmZyIsInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpQnhUVGRNNjMwUkhLVlQ2WnFTNm13aXBnbm05Y0VkMTF0UmRGMWNDVjhybWcifX0`
describe('CRUD', () => {
  describe('create', () => {
    it('can generate long form did', async () => {
      const mnemonic = vectors.wallet.operations[0].mnemonic;
      const keyType = 'secp256k1';
      const key0 = await wallet.toKeyPair(mnemonic, 0, keyType);
      const key1 = await wallet.toKeyPair(mnemonic, 1, keyType);
      const key2 = await wallet.toKeyPair(mnemonic, 2, keyType);
      const document: any = {
        publicKeys: [
          {
            id: key0.id.split('#').pop(),
            type: key0.type,
            publicKeyJwk: key0.publicKeyJwk,
            purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
          },
        ],
        services: [
          {
            id: 'example-service',
            type: 'ExampleService',
            serviceEndpoint: 'https://example.com',
          },
        ],
      } as any;

      const recoveryKey = key1.publicKeyJwk;
      const updateKey = key2.publicKeyJwk;

      const longFormDid2 = await wallet.createLongFormDid({
        method: 'elem',
        network: 'ropsten',
        document,
        updateKey,
        recoveryKey,
      });
      expect(longFormDid2).toBe(longFormDid);
      const uniqueSuffix2 = longFormDid2.split(':')[3];
      expect(uniqueSuffix2).toBe(uniqueSuffix);
    });

    it('can resolve long form did', async () => {
      const operation1 = await element.handleResolveRequest(longFormDid);
      expect(operation1).toEqual(longFormResolutionResponse);
    });

    it('can register and resolve short form did', async () => {
      const operation0 = await element.handleOperationRequest(
        Buffer.from(JSON.stringify(vectors.wallet.operations[0].op0))
      );
      expect(operation0.status).toBe('succeeded');
      expect(operation0.body).toBeDefined();

      await element.triggerBatchAndObserve();
      await new Promise((resolve) => {
        setTimeout(resolve, 20 * 1000);
      });

      const datas = await element.transactionStore.getTransactions();
      console.log(datas);

      // const did = `did:elem:ropsten:${uniqueSuffix}`;
      // const operation1 = await element.handleResolveRequest(did);
      // expect(operation1.status).toBe('succeeded');
      // expect(operation1.body.didDocument.id).toEqual(did);
    });
  });
});
