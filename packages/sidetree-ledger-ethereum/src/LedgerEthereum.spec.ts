import { LedgerEthereum } from './LedgerEthereum';


import { web3 } from './__fixtures__'

describe('LedgerEthereum', () => {
  it('constructor', () => {
    let ledger = new LedgerEthereum(web3);
    console.log(ledger)
  });
});
