import Element from '../Element';
import {
  derivedWalletContents,
  createResponse,
} from '../__fixtures__/universal-wallet-vectors';
import {
  getTestElement,
  // replaceMethod
} from '../test/utils';

console.info = () => null;

let element: Element;

beforeEach(async () => {
  element = await getTestElement();
});

afterEach(async () => {
  await element.close();
});

it('create', async () => {
  const response = await element.handleOperationRequest(
    Buffer.from(JSON.stringify(derivedWalletContents.createOperationRequest))
  );
  expect(response).toEqual(createResponse);
  await element.triggerBatchAndObserve();
  const txns = await element.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  const resolveRequest = await element.handleResolveRequest(
    response.body.didDocument.id
  );
  expect(resolveRequest).toEqual(createResponse);
});
