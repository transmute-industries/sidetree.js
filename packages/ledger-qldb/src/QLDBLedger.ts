/* eslint-disable @typescript-eslint/no-unused-vars */
import { QldbDriver, RetryConfig, Result } from 'amazon-qldb-driver-nodejs';
import {
  AnchoredDataSerializer,
  BlockchainTimeModel,
  IBlockchain,
  ServiceVersionModel,
  TransactionModel,
  ValueTimeLockModel,
} from '@sidetree/common';
import { Timestamp } from 'aws-sdk/clients/apigateway';
import QLDBSession from 'aws-sdk/clients/qldbsession';
const { version } = require('../package.json');

interface ValueWithMetaData {
  blockAddress: {
    sequenceNo: number;
  };
  data: {
    transactionNumber: number;
    numberOfOperations: number;
    anchorFileHash: string;
  };
  metadata: {
    id: string;
    txTime: Timestamp;
    txId: string;
  };
}

export default class QLDBLedger implements IBlockchain {
  public qldbDriver: QldbDriver;

  public transactionTable: string;

  constructor(
    ledgerName: string,
    tableName: string,
    config?: QLDBSession.ClientConfiguration
  ) {
    let qldbConfig: QLDBSession.ClientConfiguration;
    if (config) {
      qldbConfig = config;
    } else {
      // Load AWS credentials from ~/.aws/credentials file
      process.env.AWS_SDK_LOAD_CONFIG = '1';
      qldbConfig = {
        region: 'us-east-1',
      };
    }
    const maxConcurrentTransactions = 10;
    const retryLimit = 4;

    // Use driver's default backoff function for this example (so, no second parameter provided to RetryConfig)
    const retryConfig: RetryConfig = new RetryConfig(retryLimit);
    this.qldbDriver = new QldbDriver(
      ledgerName,
      qldbConfig,
      maxConcurrentTransactions,
      retryConfig
    );
    this.transactionTable = tableName;
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'qldb',
      version,
    };
  };

  private async execute(query: string, args?: object): Promise<Result> {
    const params = args ? [args] : [];
    return this.qldbDriver.executeLambda(async (txn) =>
      txn.execute(query, ...params)
    );
  }

  private async executeWithRetry(
    query: string,
    args?: object,
    retryCount = 0
  ): Promise<Result | void> {
    return this.execute(query, args).catch((err) => {
      if (err.message.includes('No open transaction') && retryCount < 1) {
        // Transaction failed and was rolled back.
        console.log(`retrying query ${query} with count ${retryCount}`);
        return this.executeWithRetry(query, args, retryCount + 1);
      } else {
        throw new Error(err.message);
      }
    });
  }

  private async executeWithoutError(query: string): Promise<Result> {
    return this.executeWithRetry(query).catch((err) => err.message);
  }

  public async reset(): Promise<void> {
    console.log('resetting', this.transactionTable);
    await this.executeWithRetry(`DELETE FROM ${this.transactionTable}`);
  }

  public async initialize(): Promise<void> {
    await this.executeWithoutError(`CREATE TABLE ${this.transactionTable}`);
  }

  private async getTransactionCount(): Promise<number> {
    const result = await this.executeWithRetry(
      `SELECT COUNT(*) AS transactionCount FROM ${this.transactionTable}`
    );
    const resultList = (result as Result).getResultList();
    const transactionCount = Number((resultList[0] as any).transactionCount);
    return transactionCount;
  }

  public async write(anchorString: string): Promise<void> {
    // FIXME: there is a race condition here
    // Need to figure out auto increment indexes on QLDB
    const transactionNumber = await this.getTransactionCount();
    const anchorData = AnchoredDataSerializer.deserialize(anchorString);
    await this.executeWithRetry(`INSERT INTO ${this.transactionTable} ?`, {
      ...anchorData,
      transactionNumber,
    });
  }

  private toSidetreeTransaction(
    qldbResult: ValueWithMetaData
  ): TransactionModel {
    const { blockAddress, data, metadata } = qldbResult;
    // Block information
    const transactionTime = Number(blockAddress.sequenceNo);
    // Using the document id as the transactionTimeHash allows us to perform
    // efficient queries when searching a transaction by transactionTimeHash
    // Indeed querying by document id does not result in a full table scan
    // (similar to querying by an indexed field)
    // See https://docs.aws.amazon.com/qldb/latest/developerguide/working.optimize.html
    const transactionTimeHash = metadata.id.toString();
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
    let result;
    if (sinceTransactionNumber) {
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable} as R WHERE R.data.transactionNumber >= ${sinceTransactionNumber}`
      );
    } else if (transactionTimeHash) {
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable} BY doc_id WHERE doc_id = '${transactionTimeHash}'`
      );
    } else {
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable}`
      );
    }
    const resultList: unknown[] = (result as Result).getResultList();
    const transactions: TransactionModel[] = (resultList as ValueWithMetaData[]).map(
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
