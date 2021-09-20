import Core from './Core';


import { waitSeconds, getTestSidetreeNodeInstance } from './__fixtures__/help'

// const uniqueSuffix = 'EiD351yY0XqnbCJN2MaZSQJMgG-bqmgFMDRGKawfu6_mZA';
// const longFormDid = `did:elem:ropsten:${uniqueSuffix}:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJ6UTNzaFNWVzR6SHRIZXVXRk1SVkRTRVAyaWpxdk5hMktVMnlISHNXVEYyTWc0ZkNOIiwicHVibGljS2V5SndrIjp7ImNydiI6InNlY3AyNTZrMSIsImt0eSI6IkVDIiwieCI6IlMzOTRjdXRBd0ljRHNmUGJEOWxOUk1oTEZWWUI0b3VUVHhwZ21uanRYNU0iLCJ5IjoiR01sUmJlck96SnI1UFBHU3luRnU2TWlIeFRpdEk0R2hmOVFLcUw4ZkNPUSJ9LCJwdXJwb3NlcyI6WyJhdXRoZW50aWNhdGlvbiIsImFzc2VydGlvbk1ldGhvZCIsImtleUFncmVlbWVudCJdLCJ0eXBlIjoiSnNvbldlYktleTIwMjAifV0sInNlcnZpY2VzIjpbeyJpZCI6ImV4YW1wbGUtc2VydmljZSIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJ0eXBlIjoiRXhhbXBsZVNlcnZpY2UifV19fV0sInVwZGF0ZUNvbW1pdG1lbnQiOiJFaUJNQWpTQV9BSmFzcDZDMmcwbTRxeVRFZzVJUlVBV1JsV1EzdlVfWGpDMWhRIn0sInN1ZmZpeERhdGEiOnsiZGVsdGFIYXNoIjoiRWlESjExRlByeUZfVlF0ajFYemJETXBCNklXR0FRcGtvRzdYVlNlZl85UWFmZyIsInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpQnhUVGRNNjMwUkhLVlQ2WnFTNm13aXBnbm05Y0VkMTF0UmRGMWNDVjhybWcifX0`

let sidetreeNodeInstance: Core;

beforeAll(async () => {
    sidetreeNodeInstance = await getTestSidetreeNodeInstance();
});

afterAll(async () => {
    await sidetreeNodeInstance.shutdown();
})

it.only('can resolve a long form did', async () => {
    await waitSeconds(3);
    // const result = await sidetreeNodeInstance.handleResolveRequest(longFormDid);
    console.log(sidetreeNodeInstance)
});