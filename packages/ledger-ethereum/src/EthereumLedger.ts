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
import {
  ElementContract,
  ElementEventData,
  EthereumBlock,
  EthereumFilter,
} from './types';

const { version } = require('../package.json');
// Web3 has bad types so we have to import the lib through require()
// See https://github.com/ethereum/web3.js/issues/3734
const Contract = require('web3-eth-contract');
const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class EthereumLedger implements IBlockchain {
  private logger: Console;
  public anchorContract: ElementContract;
  private cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };
  private from = '';
  private networkId = 0;

  constructor(
    public web3: any,
    public contractAddress?: string,
    logger?: Console
  ) {
    this.logger = logger || console;
    this.anchorContract = new Contract(anchorContractArtifact.abi);
    this.anchorContract.setProvider(this.web3.currentProvider);
    this.anchorContract.options.gasPrice = '100000000000';
  }

  private async getAnchorContract(): Promise<ElementContract> {
    if (!this.contractAddress) {
      await this.initialize();
    }
    return this.anchorContract;
  }

  public async initialize(): Promise<void> {
    // Set primary address
    const [from] = await utils.getAccounts(this.web3);
    this.from = from;
    this.networkId = await this.web3.eth.net.getId();
    // Set contract
    if (!this.contractAddress) {
      const deployContract = await this.anchorContract.deploy({
        data: anchorContractArtifact.bytecode,
      });
      const gas = await deployContract.estimateGas();
      const instance = (await deployContract.send({
        from,
        gas,
      })) as ElementContract;
      this.contractAddress = instance!.options.address;
      this.logger.info(
        `Creating new Element contract at address ${this.contractAddress}`
      );
    } else {
      this.logger.info(
        `Using Element contract at address ${this.contractAddress}`
      );
    }
    this.anchorContract.options.address = this.contractAddress;
    // Refresh cached block time
    await this.getLatestTime();
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'ethereum',
      version,
    };
  };

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: EthereumFilter; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    const contract = await this.getAnchorContract();
    const logs = await contract.getPastEvents('Anchor', {
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
    const contract = await this.getAnchorContract();
    const {
      anchorFileHash,
      numberOfOperations,
    } = AnchoredDataSerializer.deserialize(anchorString);
    const bytes32AnchorFileHash = utils.base58EncodedMultihashToBytes32(
      anchorFileHash
    );
    try {
      const methodCall = contract.methods.anchorHash(
        bytes32AnchorFileHash,
        numberOfOperations
      );
      const gas = await methodCall.estimateGas();
      const txn = await methodCall.send({
        from: this.from,
        gas,
      });
      switch (this.networkId) {
        // Ropsten
        case 3:
          this.logger.info(
            `Ethereum transaction successful: https://ropsten.etherscan.io/tx/${txn.transactionHash}`
          );
          break;
        // Ganache
        case 13370:
          this.logger.info(
            `Ethereum transaction successful: ${txn.transactionHash}`
          );
          break;
        default:
      }
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
