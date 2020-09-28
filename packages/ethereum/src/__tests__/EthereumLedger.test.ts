import { testSuite } from '@sidetree/ledger';
import { EthereumLedger } from '..';
import { web3 } from './web3';

const ledger = new EthereumLedger(web3);

testSuite(ledger);
