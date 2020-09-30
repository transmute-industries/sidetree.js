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

import utils from './utils';
import {
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
  AnchoredDataSerializer,
  ValueTimeLockModel,
  ServiceVersionModel,
} from '@sidetree/common';
import Web3 from 'web3';
import {
  ElementContract,
  ElementEventData,
  EthereumBlock,
  EthereumFilter,
} from './types';

const { version } = require('../package.json');
const contract = require('@truffle/contract');
const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class EthereumLedger implements IBlockchain {
  private logger: Console;
  public anchorContract: any;
  public instance: ElementContract | undefined;
  private cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };

  constructor(
    public web3: Web3,
    public contractAddress?: string,
    logger?: Console
  ) {
    this.logger = logger || console;
    this.anchorContract = contract(anchorContractArtifact);
    this.anchorContract.setProvider(this.web3.currentProvider);
    this.anchorContract.defaults({
      gasPrice: '100000000000',
    });
  }

  public async initialize(): Promise<void> {
    // Set primary address
    const [primaryAddress] = await utils.getAccounts(this.web3);
    // Set instance
    if (!this.contractAddress) {
      this.instance = await this.anchorContract.new({
        from: primaryAddress,
      });
      this.contractAddress = this.instance!.address;
      this.logger.info(
        `Creating new Element contract at address ${this.contractAddress}`
      );
    } else {
      this.logger.info(
        `Using Element contract at address ${this.contractAddress}`
      );
    }
    this.instance = await this.anchorContract.at(this.contractAddress);
    // Refresh cached block time
    await this.getLatestTime();
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'ethereum',
      version,
    };
  };

  private getInstance(): ElementContract {
    if (!this.instance) {
      throw new Error(
        'Contract instance is undefined. Call .initialize() first'
      );
    }
    return this.instance;
  }

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: EthereumFilter; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    const instance = await this.getInstance();
    const logs = await instance.getPastEvents('Anchor', {
      fromBlock,
      toBlock: toBlock || 'latest',
      filter: (options && options.filter) || undefined,
    });
    const txns = logs.map((log) =>
      utils.eventLogToSidetreeTransaction(log as ElementEventData)
    );
    if (options && options.omitTimestamp) {
      return txns;
    }
    return utils.extendSidetreeTransactionWithTimestamp(this.web3, txns);
  };

  public extendSidetreeTransactionWithTimestamp = async (
    transactions: TransactionModel[]
  ): Promise<TransactionModel[]> => {
    return utils.extendSidetreeTransactionWithTimestamp(
      this.web3,
      transactions
    );
  };

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    const options = {
      omitTimestamp: true,
    };
    let transactions: TransactionModel[];
    // if(sinceTransactionNumber) does not work because 0 evaluates to false
    // but 0 is a valid value of sinceTransactionNumber...
    if (sinceTransactionNumber !== undefined) {
      const sinceTransaction = await this._getTransactions(0, 'latest', {
        ...options,
        filter: { transactionNumber: [sinceTransactionNumber] },
      });
      if (sinceTransaction.length === 1) {
        transactions = await this._getTransactions(
          sinceTransaction[0].transactionTime,
          'latest',
          options
        );
      } else {
        transactions = [];
      }
    } else if (transactionTimeHash) {
      const block = await utils.getBlock(this.web3, transactionTimeHash);
      if (block && block.number) {
        transactions = await this._getTransactions(
          block.number,
          block.number,
          options
        );
      } else {
        transactions = [];
      }
    } else {
      transactions = await this._getTransactions(0, 'latest', options);
    }
    return {
      moreTransactions: false,
      transactions,
    };
  }

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block: EthereumBlock = await utils.getBlock(this.web3, 'latest');
    const blockchainTime: BlockchainTimeModel = {
      time: block.number,
      hash: block.hash,
    };
    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public write = async (anchorString: string, _fee = 0): Promise<void> => {
    const [from] = await utils.getAccounts(this.web3);
    const instance = this.getInstance();
    const {
      anchorFileHash,
      numberOfOperations,
    } = AnchoredDataSerializer.deserialize(anchorString);
    const bytes32AnchorFileHash = utils.base58EncodedMultihashToBytes32(
      anchorFileHash
    );
    try {
      const txn = await instance.anchorHash(
        bytes32AnchorFileHash,
        numberOfOperations,
        {
          from,
        }
      );
      this.logger.info(
        `Ethereum transaction successful: https://ropsten.etherscan.io/tx/${txn.tx}`
      );
    } catch (err) {
      this.logger.error(err.message);
    }
  };

  public async getFirstValidTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return Promise.resolve(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  getValueTimeLock(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }
}
