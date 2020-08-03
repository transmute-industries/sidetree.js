import retry from 'async-retry';
import BatchScheduler from '../../write/BatchScheduler';
import MockBatchWriter from '../mocks/MockBatchWriter';
import { MockLedger } from '@sidetree/ledger';
import MockVersionManager from '../mocks/MockVersionManager';

// eslint-disable-next-line @typescript-eslint/no-empty-function
console.info = () => {};

describe('BatchScheduler', () => {
  it('should periodically invoke batch writer.', async () => {
    const blockchain = new MockLedger();
    const batchWriter = new MockBatchWriter();

    const versionManager = new MockVersionManager();
    const spy = jest.spyOn(versionManager, 'getBatchWriter');
    spy.mockReturnValue(batchWriter);

    const batchScheduler = new BatchScheduler(versionManager, blockchain, 1);

    batchScheduler.startPeriodicBatchWriting();

    // Monitor the Batch Scheduler until the Batch Writer is invoked or max retries is reached.
    await retry(
      async () => {
        if (batchWriter.invocationCount >= 2) {
          return;
        }

        // NOTE: if anything throws, we retry.
        throw new Error('Batch writer not invoked.');
      },
      {
        retries: 5,
        minTimeout: 1000, // milliseconds
        maxTimeout: 1000, // milliseconds
      }
    );

    batchScheduler.stopPeriodicBatchWriting();

    expect(batchWriter.invocationCount).toBeGreaterThanOrEqual(2);
  });
});
