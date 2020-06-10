import BatchWriter from '../../write/BatchWriter';
import MockBlockchain from '../mocks/MockBlockchain';
import MockCas from '../mocks/MockCas';
import MockOperationQueue from '../mocks/MockOperationQueue';
import ProtocolParameters from '@sidetree/common/src/util/ProtocolParameters';

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
      expect(actual).toEqual(ProtocolParameters.maxOperationsPerBatch);
    });
  });
});
