import vectors from '@sidetree/test-vectors';
import Core from '../Core';

import { getTestSidetreeNodeInstance } from '../__fixtures__/help';

let sidetreeNodeInstance: Core;

beforeAll(async () => {
    sidetreeNodeInstance = await getTestSidetreeNodeInstance();
});

afterAll(async () => {
    await sidetreeNodeInstance.shutdown();
})

it('can resolve a long form did', async () => {
    const { longFormDid } = vectors.didMethod.operations.create;
    const result = await sidetreeNodeInstance.handleResolveRequest(
        longFormDid
    );
    expect(result.body.didDocument.id).toEqual(longFormDid);
});