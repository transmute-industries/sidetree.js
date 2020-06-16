import BatchWriter from '../../write/BatchWriter';
import { MockBlockchain } from '@sidetree/ledger';
import MockCas from '@sidetree/ipfs/src/MockCas';
import MockOperationQueue from '../mocks/MockOperationQueue';
import { protocolParameters } from '@sidetree/common';

describe('BatchWriter', () => {
  let batchWriter: BatchWriter;

  beforeAll(() => {
    batchWriter = new BatchWriter(
      new MockOperationQueue(),
      new MockBlockchain(),
      new MockCas()
    );
  });

  describe('getNumberOfOperationsToWrite', () => {
    it('should return the value from the lock verifier', () => {
      const actual = batchWriter['getNumberOfOperationsToWrite']();
      expect(actual).toEqual(protocolParameters.maxOperationsPerBatch);
    });
  });
});
