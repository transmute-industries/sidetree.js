import vectors from '@sidetree/test-vectors';
import Element from '../../Element';
import { getTestElement, clearCollection } from '../../test/utils';

import { longFormResolutionResponse } from './__fixtures__';

import { SidetreeWalletPlugin } from '@sidetree/wallet';

let element: Element;

// const WRITE_FIXTURE_TO_DISK = false;

beforeAll(async () => {
  element = await getTestElement();
  await clearCollection('service');
  await clearCollection('operations');
  await clearCollection('transactions');
  await clearCollection('queued-operations');
});

afterAll(async () => {
  await element.shutdown();
});

jest.setTimeout(60 * 1000);

const wallet = SidetreeWalletPlugin.build();

const uniqueSuffix = 'EiD351yY0XqnbCJN2MaZSQJMgG-bqmgFMDRGKawfu6_mZA';
const longFormDid = `did:elem:ganache:${uniqueSuffix}:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJ6UTNzaFNWVzR6SHRIZXVXRk1SVkRTRVAyaWpxdk5hMktVMnlISHNXVEYyTWc0ZkNOIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6IlMzOTRjdXRBd0ljRHNmUGJEOWxOUk1oTEZWWUI0b3VUVHhwZ21uanRYNU0iLCJ5IjoiR01sUmJlck96SnI1UFBHU3luRnU2TWlIeFRpdEk0R2hmOVFLcUw4ZkNPUSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCIsImtleUFncmVlbWVudCJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifV0sInNlcnZpY2VzIjpbeyJpZCI6ImV4YW1wbGUtc2VydmljZSIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJ0eXBlIjoiRXhhbXBsZVNlcnZpY2UifV19fV0sInVwZGF0ZUNvbW1pdG1lbnQiOiJFaUJNQWpTQV9BSmFzcDZDMmcwbTRxeVRFZzVJUlVBV1JsV1EzdlVfWGpDMWhRIn0sInN1ZmZpeERhdGEiOnsiZGVsdGFIYXNoIjoiRWlESjExRlByeUZfVlF0ajFYemJETXBCNklXR0FRcGtvRzdYVlNlZl85UWFmZyIsInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpQnhUVGRNNjMwUkhLVlQ2WnFTNm13aXBnbm05Y0VkMTF0UmRGMWNDVjhybWcifX0`;

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
        network: 'ganache',
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

      await new Promise((resolve) => {
        setTimeout(resolve, 2 * 1000);
      });

      const did = `did:elem:ganache:${uniqueSuffix}`;
      const operation1 = await element.handleResolveRequest(did);
      expect(operation1.status).toBe('succeeded');
      expect(operation1.body.didDocument.id).toEqual(did);
    });
  });
});
