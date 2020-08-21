import Element from '../Element';
import { generatedTestVectors } from '@sidetree/test-vectors';
import { getTestElement } from './utils';

const { longFormDid, longFormResolveBody } = generatedTestVectors;

console.info = () => null;

describe('Element initial state', () => {
  let element: Element;

  beforeAll(async () => {
    element = await getTestElement();
  });

  afterAll(async () => {
    await element.close();
  });

  it('should immediatly resolve a did with initial state', async () => {
    const operation = await element.handleResolveRequest(longFormDid);
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(longFormResolveBody);
  });
});
