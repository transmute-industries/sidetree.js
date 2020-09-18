import Element from '../Element';

import {
  getTestElement,
  resetDatabase,
  // writeFixture
} from '../test/utils';

console.info = () => null;

const createOperation = {
  type: 'create',
  suffix_data:
    'eyJkZWx0YV9oYXNoIjoiRWlEbFZLb1pmeGhubjdkbTRhTUs3YWxNakJINXgwT2JYeFBUaU5hMVRNR1NQUSIsInJlY292ZXJ5X2NvbW1pdG1lbnQiOiJFaUJoYmtnSlZNdUxHQWZ4RjZHSEJaOGFEcE92UFlOMWNJOW1SZXJfaTZNS2V3In0',
  delta:
    'eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljX2tleXMiOlt7ImlkIjoiejZNa2V0VlJkdGp0UGtudDFmZmJieDdLWEJqR0w5RVJIdUpIS3p5Mjh5dXltSFFhIiwiandrIjp7ImNydiI6IkVkMjU1MTkiLCJraWQiOiJEclVTcDBNbk44dHhjMEotb2RFWERSdS1RUlJEcE9QOWMyYXdLR1cyT3prIiwia3R5IjoiT0tQIiwieCI6IkJuYW1McjltVjJnb0R4NGdmRnphQkNCWFd5MkJwYTY0Y05OaFZNSWU0dmMifSwicHVycG9zZSI6WyJnZW5lcmFsIiwiYXV0aCIsImFzc2VydGlvbiIsImludm9jYXRpb24iLCJkZWxlZ2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9LHsiaWQiOiJ6NkxTcXc1SnVWUzJhVWZiWkNZeVo5R0tSZ1JTNkY4NUxreG9YVW52S3VkclI4eW0iLCJqd2siOnsiY3J2IjoiWDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6IjA5UzFVeEM2S2hmTFllb242ZlZlN0g3TWl5WWlEODgyOHpCSE5mMy1qQ2cifSwicHVycG9zZSI6WyJnZW5lcmFsIiwiYWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XX19XSwidXBkYXRlX2NvbW1pdG1lbnQiOiJFaUJoYmtnSlZNdUxHQWZ4RjZHSEJaOGFEcE92UFlOMWNJOW1SZXJfaTZNS2V3In0',
};

let element: Element;

beforeAll(async () => {
  await resetDatabase();
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

jest.setTimeout(60 * 1000);

it('SVIP Profile Sanity', async () => {
  let response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(createOperation))
  );
  expect(response).toEqual({
    status: 'succeeded',
    body: {
      '@context': 'https://www.w3.org/ns/did-resolution/v1',
      didDocument: {
        id: 'did:elem:EiBgIPXdkzvkFyTxY8WhwY_IzmUgDuGRwqDwbB4IP3Usig',
        '@context': [
          'https://www.w3.org/ns/did/v1',
          {
            '@base': 'did:elem:EiBgIPXdkzvkFyTxY8WhwY_IzmUgDuGRwqDwbB4IP3Usig',
          },
        ],
        publicKey: [
          {
            id: '#z6MketVRdtjtPknt1ffbbx7KXBjGL9ERHuJHKzy28yuymHQa',
            controller:
              'did:elem:EiBgIPXdkzvkFyTxY8WhwY_IzmUgDuGRwqDwbB4IP3Usig',
            type: 'JsonWebKey2020',
            publicKeyJwk: {
              crv: 'Ed25519',
              kid: 'DrUSp0MnN8txc0J-odEXDRu-QRRDpOP9c2awKGW2Ozk',
              kty: 'OKP',
              x: 'BnamLr9mV2goDx4gfFzaBCBXWy2Bpa64cNNhVMIe4vc',
            },
          },
          {
            id: '#z6LSqw5JuVS2aUfbZCYyZ9GKRgRS6F85LkxoXUnvKudrR8ym',
            controller:
              'did:elem:EiBgIPXdkzvkFyTxY8WhwY_IzmUgDuGRwqDwbB4IP3Usig',
            type: 'JsonWebKey2020',
            publicKeyJwk: {
              crv: 'X25519',
              kty: 'OKP',
              x: '09S1UxC6KhfLYeon6fVe7H7MiyYiD8828zBHNf3-jCg',
            },
          },
        ],
        authentication: ['#z6MketVRdtjtPknt1ffbbx7KXBjGL9ERHuJHKzy28yuymHQa'],
        assertionMethod: ['#z6MketVRdtjtPknt1ffbbx7KXBjGL9ERHuJHKzy28yuymHQa'],
        capabilityInvocation: [
          '#z6MketVRdtjtPknt1ffbbx7KXBjGL9ERHuJHKzy28yuymHQa',
        ],
        capabilityDelegation: [
          '#z6MketVRdtjtPknt1ffbbx7KXBjGL9ERHuJHKzy28yuymHQa',
        ],
        keyAgreement: ['#z6LSqw5JuVS2aUfbZCYyZ9GKRgRS6F85LkxoXUnvKudrR8ym'],
      },
      methodMetadata: {
        recoveryCommitment: 'EiBhbkgJVMuLGAfxF6GHBZ8aDpOvPYN1cI9mRer_i6MKew',
        updateCommitment: 'EiBhbkgJVMuLGAfxF6GHBZ8aDpOvPYN1cI9mRer_i6MKew',
      },
    },
  });
  // console.log(JSON.stringify(response, null, 2));
});
