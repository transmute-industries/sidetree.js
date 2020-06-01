import { generateCreateOperation } from '../src';

describe('create', () => {
  it('should generate a create operation', async () => {
    const createOperation = await generateCreateOperation();
    expect(createOperation).toBeDefined();
  });
});
