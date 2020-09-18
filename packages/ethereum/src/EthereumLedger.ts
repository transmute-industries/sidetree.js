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
import { BlockTransactionString } from 'web3-eth';

const contract = require('@truffle/contract');
const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class EthereumLedger implements IBlockchain {
  /** Interval for refreshing the cached blockchain time. */
  static readonly cachedBlockchainTimeRefreshInSeconds = 60;

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

  public anchorContractAddress?: string;
  private logger: Console;
  public anchorContract: any;
  public resolving: Promise<any> | null = null;
  public instance: any;
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

    if (contractAddress) {
      this.anchorContractAddress = contractAddress;
    } else {
      this.resolving = this._createNewContract();
    }
  }

  public initialize: VoidFunction = async () => {
    await this._getInstance();
    await this.getLatestTime();
  };

  /**
   * The function that starts periodically anchoring operation batches to blockchain.
   */
  public startPeriodicCachedBlockchainTimeRefresh: VoidFunction = () => {
    setInterval(
      async () => this.getLatestTime(),
      EthereumLedger.cachedBlockchainTimeRefreshInSeconds * 1000
    );
  };

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: '',
      version: 'v0.0.1',
    };
  };

  public _getInstance = async (): Promise<any> => {
    if (!this.instance) {
      this.instance = await this.anchorContract.at(this.anchorContractAddress);
    }
    return this.instance;
  };

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: { filter?: any; omitTimestamp?: boolean }
  ): Promise<TransactionModel[]> => {
    const instance = await this._getInstance();
    const logs = await instance.getPastEvents('Anchor', {
      fromBlock,
      toBlock: toBlock || 'latest',
      filter: (options && options.filter) || undefined,
    });
    const txns = logs.map(utils.eventLogToSidetreeTransaction);
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

  public _createNewContract = async (fromAddress?: string): Promise<any> => {
    const from = fromAddress || (await utils.getAccounts(this.web3))[0];
    const instance = await this.anchorContract.new({
      from,
    });
    this.anchorContractAddress = instance.address;
    this.logger.info('_createNewContract', this.anchorContractAddress);
    return instance;
  };

  public async read(
    sinceTransactionNumber?: number,
    _transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    const options = {
      omitTimestamp: true,
    };
    let transactions: TransactionModel[];
    if (sinceTransactionNumber) {
      const sinceTransaction = await this._getTransactions(0, 'latest', {
        ...options,
        filter: { transactionNumber: [sinceTransactionNumber] },
      });
      const sinceBlockNumber =
        sinceTransaction.length === 1 ? sinceTransaction[0].transactionTime : 0;
      transactions = await this._getTransactions(
        sinceBlockNumber,
        'latest',
        options
      );
    } else if (_transactionTimeHash) {
      const block = await utils.getBlock(this.web3, _transactionTimeHash);
      transactions = await this._getTransactions(
        block.number,
        block.number,
        options
      );
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
    const block: BlockTransactionString = await utils.getBlock(
      this.web3,
      'latest'
    );
    const blockchainTime: BlockchainTimeModel = {
      time: block.number,
      hash: block.hash,
    };
    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public write = async (anchorString: string, _fee = 0): Promise<void> => {
    await this.resolving;
    const [from] = await utils.getAccounts(this.web3);
    const instance = await this._getInstance();
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
}
