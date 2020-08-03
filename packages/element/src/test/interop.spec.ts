import Element from '../Element';
import * as fs from 'fs';
import * as path from 'path';
import { getTestElement } from './utils';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

describe.skip('interop', () => {
  it('should get versions', async () => {
    const versions = await element.handleGetVersionRequest();
    expect(versions.status).toBe('succeeded');
    expect(JSON.parse(versions.body)).toHaveLength(3);
  });

  it('should handle create operation', async () => {
    const create = fs.readFileSync(
      path.resolve(__dirname, './__fixtures__/interop/update/create.json')
    );
    const operation = await element.handleOperationRequest(create);
    expect(operation.status).toBe('succeeded');
  });

  it('should resolve after create', async () => {
    await element.triggerBatchAndObserve();
    const operation = await element.handleResolveRequest(
      'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
    );
    expect(operation.status).toBe('succeeded');
  });

  it('should handle update operation', async () => {
    const update = fs.readFileSync(
      path.resolve(__dirname, './__fixtures__/interop/update/update.json')
    );
    const operation = await element.handleOperationRequest(update);
    expect(operation.status).toBe('succeeded');
  });

  it('should resolve after update', async () => {
    await element.triggerBatchAndObserve();
    const operation = await element.handleResolveRequest(
      'did:elem:EiDpoi14bmEVVUp-woMgEruPyPvVEMtOsXtyo51eQ0Tdig'
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body.didDocument.publicKey[1].id).toBe('#new-key1');
  });
});
