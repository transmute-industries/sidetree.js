import { filesystem } from '@sidetree/test-vectors';
import { getWeb3 } from './web3';
import { EthereumLedger } from '..';

const { anchorString } = filesystem.anchorFile;

const logger = console;
const w31 = getWeb3();
const w32 = getWeb3();

jest.setTimeout(10 * 1000);

describe('Concurrency', () => {
  let contractAddress: string | undefined;

  beforeAll(async () => {
    const ledger0 = new EthereumLedger(w31);
    await ledger0.initialize();
    contractAddress = ledger0.contractAddress;
  });

  it('should be possible to write concurrently', async () => {
    const ledger1 = new EthereumLedger(w31, contractAddress, logger);
    await ledger1.initialize();
    const ledger2 = new EthereumLedger(w32, contractAddress, logger);
    await ledger2.initialize();
    expect(ledger1).toBeDefined();
    expect(ledger2).toBeDefined();

    try {
      await ledger1.write(anchorString);
      await ledger1.write(anchorString);
      await ledger2.write(anchorString);
      await ledger2.write(anchorString);
      await ledger1.write(anchorString);
      await ledger1.write(anchorString);
      await ledger2.write(anchorString);
      await ledger2.write(anchorString);
      await ledger1.write(anchorString);
      await ledger1.write(anchorString);
      await ledger2.write(anchorString);
      await ledger2.write(anchorString);
    } catch (e) {
      console.error(e);
    }
  });
});
