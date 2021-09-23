import { wallet } from '@sidetree/test-vectors';
import { computeDidUniqueSuffix } from './computeDidUniqueSuffix';

it('computeDidUniqueSuffix', () => {
  const result = computeDidUniqueSuffix(wallet.operations[0].op0.suffixData);
  expect(result).toBe('EiD351yY0XqnbCJN2MaZSQJMgG-bqmgFMDRGKawfu6_mZA');
});
