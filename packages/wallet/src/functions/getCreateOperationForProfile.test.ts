import * as fixtures from '../__fixtures__';

import { getCreateOperationForProfile } from './getCreateOperationForProfile';

it('can get create operation from mnemonic', async () => {
  const createOperation = await getCreateOperationForProfile(
    fixtures.walletOperation.operation[0].mnemonic,
    0,
    'SVIP'
  );
  expect(createOperation).toEqual({
    type: 'create',
    suffix_data:
      'eyJkZWx0YV9oYXNoIjoiRWlEbFZLb1pmeGhubjdkbTRhTUs3YWxNakJINXgwT2JYeFBUaU5hMVRNR1NQUSIsInJlY292ZXJ5X2NvbW1pdG1lbnQiOiJFaUJoYmtnSlZNdUxHQWZ4RjZHSEJaOGFEcE92UFlOMWNJOW1SZXJfaTZNS2V3In0',
    delta:
      'eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljX2tleXMiOlt7ImlkIjoiejZNa2V0VlJkdGp0UGtudDFmZmJieDdLWEJqR0w5RVJIdUpIS3p5Mjh5dXltSFFhIiwiandrIjp7ImNydiI6IkVkMjU1MTkiLCJraWQiOiJEclVTcDBNbk44dHhjMEotb2RFWERSdS1RUlJEcE9QOWMyYXdLR1cyT3prIiwia3R5IjoiT0tQIiwieCI6IkJuYW1McjltVjJnb0R4NGdmRnphQkNCWFd5MkJwYTY0Y05OaFZNSWU0dmMifSwicHVycG9zZSI6WyJnZW5lcmFsIiwiYXV0aCIsImFzc2VydGlvbiIsImludm9jYXRpb24iLCJkZWxlZ2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9LHsiaWQiOiJ6NkxTcXc1SnVWUzJhVWZiWkNZeVo5R0tSZ1JTNkY4NUxreG9YVW52S3VkclI4eW0iLCJqd2siOnsiY3J2IjoiWDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6IjA5UzFVeEM2S2hmTFllb242ZlZlN0g3TWl5WWlEODgyOHpCSE5mMy1qQ2cifSwicHVycG9zZSI6WyJnZW5lcmFsIiwiYWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XX19XSwidXBkYXRlX2NvbW1pdG1lbnQiOiJFaUJoYmtnSlZNdUxHQWZ4RjZHSEJaOGFEcE92UFlOMWNJOW1SZXJfaTZNS2V3In0',
  });
});
