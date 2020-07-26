import Element from '../Element';
import { longFormDid, longFormResolveBody } from './__fixtures__';
import { getTestElement } from './utils';

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
