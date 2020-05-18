import path from 'path';
import { getWeb3 } from '../__fixtures__';
import { LedgerEthereum } from '..';
const  HDWalletProvider = require("@truffle/hdwallet-provider");

// ensure that environment is ropsten, protect these secrets...
require('dotenv').config({ path: path.resolve(__dirname, '../../ropsten.env') });

// Or, use your own hierarchical derivation path
const hdPath = "m/44'/60'/0'/0/0";
const parts: any = hdPath.split('/');
const accountIndex = parseInt(parts.pop(), 10);
const hdPathWithoutAccountIndex = `${parts.join('/')}/`;
const provider1 = new HDWalletProvider(
  process.env.MNEMONIC,
  process.env.ETHEREUM_PROVIDER,
  accountIndex,
  1,
  hdPathWithoutAccountIndex
);

const provider2 = new HDWalletProvider(
  process.env.MNEMONIC,
  process.env.ETHEREUM_PROVIDER,
  accountIndex,
  1,
  hdPathWithoutAccountIndex
);

jest.setTimeout(1 * 60 * 1000);

describe.skip('Ropsten', () => {

  let ledger1: LedgerEthereum;
  let ledger2: LedgerEthereum;
  beforeAll(async () => {
    ledger1 = new LedgerEthereum(
      getWeb3(provider1),
      process.env.ELEMENT_CONTRACT,
      // logger
    );
    ledger2 = new LedgerEthereum(
      getWeb3(provider2),
      process.env.ELEMENT_CONTRACT,
      // logger
    );
  });

  // https://ropsten.etherscan.io/address/0xD49Da2b7C0A15f6ac5A856f026D68A9B9848D96f
  it('read txns', async () => {
    const txns = await ledger1.getTransactions(7907400, 'latest')
    expect(txns).toBeDefined()
  })

  it('write txn', async () => {
    ledger1.write('QmR1HueTM15tji1hcQR5oE4p98wLybTCxAeaBKNZ6Gpii7');
    ledger2.write('QmR1HueTM15tji1hcQR5oE4p98wLybTCxAeaBKNZ6Gpii7');
    ledger1.write('QmR1HueTM15tji1hcQR5oE4p98wLybTCxAeaBKNZ6Gpii7');
    ledger2.write('QmR1HueTM15tji1hcQR5oE4p98wLybTCxAeaBKNZ6Gpii7');
    const txn = await ledger1.write('QmR1HueTM15tji1hcQR5oE4p98wLybTCxAeaBKNZ6Gpii7');
    // console.log(txn);
    expect(txn).toBeDefined();
  })

  
});
