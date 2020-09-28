import { EventLog, TransactionReceipt } from 'web3-core';
import {
  Contract,
  ContractOptions,
  EventData,
  Filter,
} from 'web3-eth-contract';
import BN from 'bn.js';
import { BlockTransactionString } from 'web3-eth';

export type EthereumBlock = BlockTransactionString;

export type EthereumFilter = Filter;

export interface ElementEventData extends EventData {
  args: {
    anchorFileHash: string;
    numberOfOperations: string;
    transactionNumber: BN;
  };
}

export interface ElementContract extends Contract {
  address: string;
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
