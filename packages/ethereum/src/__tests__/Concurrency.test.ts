import { ledger as fixtures } from '@sidetree/test-vectors';
import { getWeb3 } from './web3';
import { EthereumLedger } from '..';

const { logger, anchorString } = fixtures;

const w31 = getWeb3();
const w32 = getWeb3();

jest.setTimeout(10 * 1000);

describe('Concurrency', () => {
  let anchorContractAddress: any;

  beforeAll(async () => {
    const ledger0 = new EthereumLedger(
      w31,
      '0xeaf43D28235275afDB504aBF49863e778a4Cfea0',
      logger
    );
    await ledger0._createNewContract();
    anchorContractAddress = ledger0.anchorContractAddress;
  });

  it('should be possible to write concurrently', async () => {
    const ledger1 = new EthereumLedger(w31, anchorContractAddress, logger);
    const ledger2 = new EthereumLedger(w32, anchorContractAddress, logger);
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
