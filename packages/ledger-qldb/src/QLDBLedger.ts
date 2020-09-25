/* eslint-disable @typescript-eslint/no-unused-vars */
import { QldbDriver, RetryConfig } from 'amazon-qldb-driver-nodejs';
import {
  AnchoredDataSerializer,
  BlockchainTimeModel,
  IBlockchain,
  TransactionModel,
  ValueTimeLockModel,
} from '@sidetree/common';

type QLDBQueryResponse = any;

export default class QLDBLedger implements IBlockchain {
  public qldbDriver: QldbDriver;

  public transactionTable: string;

  constructor(ledgerName: string, tableName: string) {
    const serviceConfigurationOptions = {
      region: 'us-east-1',
    };
    const maxConcurrentTransactions = 10;
    const retryLimit = 4;

    // Use driver's default backoff function for this example (so, no second parameter provided to RetryConfig)
    const retryConfig: RetryConfig = new RetryConfig(retryLimit);
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    this.qldbDriver = new QldbDriver(
      ledgerName,
      serviceConfigurationOptions,
      maxConcurrentTransactions,
      retryConfig
    );
    this.transactionTable = tableName;
  }

  private async execute(
    query: string,
    args?: object
  ): Promise<QLDBQueryResponse> {
    const params = args ? [args] : [];
    return this.qldbDriver.executeLambda(async txn =>
      txn.execute(query, ...params)
    );
  }

  private async executeWithoutError(query: string): Promise<QLDBQueryResponse> {
    return this.execute(query).catch(err => err.message);
  }

  public async reset(): Promise<void> {
    console.log('resetting', this.transactionTable);
    await this.execute(`DELETE FROM ${this.transactionTable}`);
  }

  public async initialize(): Promise<void> {
    await this.executeWithoutError(`CREATE TABLE ${this.transactionTable}`);
    await this.executeWithoutError(
      `CREATE INDEX ON ${this.transactionTable} (transactionNumber)`
    );
  }

  private async getTransactionCount(): Promise<number> {
    const result = await this.execute(
      `SELECT COUNT(*) AS transactionCount FROM ${this.transactionTable}`
    );
    const resultList = result.getResultList();
    const transactionCount = Number(resultList[0].transactionCount);
    return transactionCount;
  }

  public async write(anchorString: string): Promise<void> {
    // FIXME: there is a race condition here
    // Need to figure out auto increment indexes on QLDB
    const transactionNumber = await this.getTransactionCount();
    const anchorData = AnchoredDataSerializer.deserialize(anchorString);
    await this.execute(`INSERT INTO ${this.transactionTable} ?`, {
      ...anchorData,
      transactionNumber,
    });
  }

  private toSidetreeTransaction(qldbResult: any): TransactionModel {
    const { blockAddress, data, metadata } = qldbResult;
    // Block information
    const transactionTime = Number(blockAddress.sequenceNo);
    const transactionTimeHash = metadata.txId.toString();
    // Transaction information
    const transactionNumber = Number(data.transactionNumber);
    const transactionTimestamp = metadata.txTime.getTime();
    // Anchor file information
    const { anchorFileHash } = data;
    const numberOfOperations = Number(data.numberOfOperations);
    const anchorString = AnchoredDataSerializer.serialize({
      anchorFileHash,
      numberOfOperations,
    });
    return {
      transactionNumber,
      transactionTime,
      transactionHash: transactionTimeHash,
      transactionTimeHash,
      transactionTimestamp,
      anchorString,
      transactionFeePaid: 0,
      normalizedTransactionFee: 0,
      writer: 'writer',
    };
  }

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{
    moreTransactions: boolean;
    transactions: TransactionModel[];
  }> {
    let result: QLDBQueryResponse;
    if (sinceTransactionNumber) {
      result = await this.execute(
        `SELECT * FROM _ql_committed_${this.transactionTable} as R WHERE R.data.transactionNumber >= ${sinceTransactionNumber}`
      );
    } else if (transactionTimeHash) {
      result = await this.execute(
        `SELECT * FROM _ql_committed_${this.transactionTable} as R WHERE R.metadata.txId IN ('${transactionTimeHash}')`
      );
    } else {
      result = await this.execute(
        `SELECT * FROM _ql_committed_${this.transactionTable}`
      );
    }
    const resultList = result.getResultList();
    const transactions: TransactionModel[] = resultList.map(
      this.toSidetreeTransaction
    );
    // Sort by increasing order of transaction number
    // TODO: Sort with PartiQL ?
    transactions.sort((t1, t2) => {
      return t1.transactionNumber - t2.transactionNumber;
    });
    return {
      moreTransactions: false,
      transactions,
    };
  }

  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return Promise.resolve(undefined);
  }

  public approximateTime: BlockchainTimeModel = {
    time: 0,
    hash: '',
  };

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const transactionCount = await this.getTransactionCount();
    if (transactionCount > 0) {
      const latestTime = transactionCount - 1;
      this.approximateTime.time = latestTime;
    }
    return this.approximateTime;
  }

  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  getValueTimeLock(
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }
}
