import { EventLog, TransactionReceipt } from 'web3-core';
import { Contract, ContractOptions, EventData } from 'web3-eth-contract';
import BN from 'bn.js';
import { BlockTransactionString } from 'web3-eth';

export type EthereumBlock = BlockTransactionString;

export interface ElementEventData extends EventData {
  args: {
    anchorFileHash: string;
    numberOfOperations: string;
    transactionNumber: BN;
  };
}

export interface ElementContract extends Contract {
  anchorHash: (
    anchorFileHash: string,
    numberOfOperations: number,
    options?: ContractOptions
  ) => {
    tx: string;
    receipt: TransactionReceipt;
    logs: EventLog[];
  };
}
