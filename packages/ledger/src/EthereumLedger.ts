import utils from './utils';
import {
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
  AnchoredDataSerializer,
  ValueTimeLockModel,
  ServiceVersionModel,
} from '@sidetree/common';

const contract = require('@truffle/contract');
const anchorContractArtifact = require('../build/contracts/SimpleSidetreeAnchor.json');

export default class EthereumLedger implements IBlockchain {
  /** Interval for refreshing the cached blockchain time. */
  static readonly cachedBlockchainTimeRefreshInSeconds = 60;

  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
    // throw new Error('Method not implemented.');
  }

  getValueTimeLock(
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
    // throw new Error('Method not implemented.');
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
    // throw new Error('Method not implemented.');
  }

  public anchorContractAddress?: string;
  private logger: any;
  public anchorContract: any;
  public resolving: any;
  public instance: any;
  private cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };

  constructor(public web3: any, public contractAddress?: string, logger?: any) {
    this.logger = logger || console;
    this.anchorContract = contract(anchorContractArtifact);
    this.anchorContract.setProvider(this.web3.currentProvider);

    if (contractAddress) {
      this.anchorContractAddress = contractAddress;
    } else {
      this.resolving = this._createNewContract().then((instance: any) => {
        this.anchorContract.setProvider(this.web3.currentProvider);
        this.anchorContractAddress = instance.address;
      });
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

  public _getInstance: any = async () => {
    if (!this.instance) {
      this.instance = await this.anchorContract.at(this.anchorContractAddress);
    }
    return this.instance;
  };

  public _getTransactions = async (
    fromBlock: number | string,
    toBlock: number | string,
    options?: any
  ): Promise<TransactionModel[]> => {
    const instance = await this._getInstance();
    const logs = await instance.getPastEvents('Anchor', {
      fromBlock,
      toBlock: toBlock || 'latest',
      filter: options.filter || undefined,
    });
    const txns = logs.map(utils.eventLogToSidetreeTransaction);
    if (options && options.omitTimestamp) {
      return txns;
    }
    return utils.extendSidetreeTransactionWithTimestamp(this.web3, txns);
  };

  public _createNewContract = async (fromAddress?: string) => {
    const from = fromAddress || (await utils.getAccounts(this.web3))[0];
    const instance = await utils.retryWithLatestTransactionCount(
      this.web3,
      this.anchorContract.new,
      [],
      {
        from,
        // TODO: Bad hard coded value, use gasEstimate
        gas: 4712388,
      }
    );
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
    } else if (!_transactionTimeHash) {
      const block = await utils.getBlock(this.web3, _transactionTimeHash);
      transactions = await this._getTransactions(
        block.number,
        'latest',
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

  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    // Not implemented, because not needed
    throw new Error('Not implemented');
  }

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block: any = await new Promise((resolve, reject) => {
      this.web3.eth.getBlock('latest', (err: Error, b: any) => {
        if (err) {
          reject(err);
        }
        resolve(b);
      });
    });
    const blockchainTime: BlockchainTimeModel = {
      time: block.number,
      hash: block.hash,
    };
    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }

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
      await utils.retryWithLatestTransactionCount(
        this.web3,
        instance.anchorHash,
        [bytes32AnchorFileHash, numberOfOperations],
        {
          from,
          gasPrice: '100000000000',
        }
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  };
}
