import { MockCas } from '@sidetree/cas';
import { AnchorFile } from '@sidetree/core';
import Element from '../Element';
import {
  anchorFile,
  createOperationBuffer,
} from './__fixtures__';
import { getTestElement } from './utils';

console.info = () => null;

let element: Element;

beforeAll(async () => {
  element = await getTestElement();
});

afterAll(async () => {
  await element.close();
});

it('should generate a valid anchor file', async () => {
  expect.assertions(1);
  const spy = jest.spyOn((element as any).cas, 'write');
  spy.mockImplementation(async (content) => {
    try {
      const parsedAnchorFile = await AnchorFile.parse(content as Buffer)
      expect(parsedAnchorFile).toEqual(anchorFile);
    } catch (e) {
      // If we reach this point, the content was not an anchorFileBuffer
    }
    const encodedHash = await MockCas.getAddress(content as Buffer);
    return encodedHash;
  });
  await element.handleOperationRequest(createOperationBuffer);
  await element.triggerBatchWriting();
});
