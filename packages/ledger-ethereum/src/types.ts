/*
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
