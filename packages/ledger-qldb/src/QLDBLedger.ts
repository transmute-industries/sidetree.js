/* eslint-disable @typescript-eslint/no-unused-vars */
import { QldbDriver, RetryConfig, Result } from 'amazon-qldb-driver-nodejs';
import {
  BlockchainTimeModel,
  IBlockchain,
  ServiceVersionModel,
  TransactionModel,
  ValueTimeLockModel,
} from '@sidetree/common';

import { AnchoredDataSerializer } from '@sidetree/core';

import { Timestamp } from 'aws-sdk/clients/apigateway';
import QLDBSession from 'aws-sdk/clients/qldbsession';

const { version } = require('../package.json');

interface ValueWithMetaData {
  blockAddress: {
    sequenceNo: number;
  };
  data: {
    numberOfOperations: number;
    anchorFileHash: string;
  };
  metadata: {
    id: string;
    txTime: Timestamp;
    txId: string;
  };
}

export interface TransactionModelQLDB extends TransactionModel {
  transactionTimestamp: number; // unix timestamp
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

  public getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'qldb',
      version,
    });
  }

  private async execute(query: string, args?: object): Promise<Result> {
    const params = args ? [args] : [];
    return await this.qldbDriver.executeLambda(
      async (txn) => await txn.execute(query, ...params)
    );
  }

  private async executeWithRetry(
    query: string,
    args?: object,
    retryCount = 0
  ): Promise<Result | void> {
    return await this.execute(query, args).catch(async (err) => {
      if (err.message.includes('No open transaction') && retryCount < 1) {
        // Transaction failed and was rolled back.
        console.log(`retrying query ${query} with count ${retryCount}`);
        const r = await this.executeWithRetry(query, args, retryCount + 1);
        return r;
      } else {
        throw new Error(err.message);
      }
    });
  }

  private async executeWithoutError(query: string): Promise<Result> {
    return await this.executeWithRetry(query).catch((err) => err.message);
  }

  public async reset(): Promise<void> {
    console.log('resetting', this.transactionTable);
    await this.executeWithRetry(`DELETE FROM ${this.transactionTable}`);
  }

  public async initialize(): Promise<void> {
    await this.executeWithoutError(`CREATE TABLE ${this.transactionTable}`);
  }

  public async write(anchorString: string): Promise<void> {
    // TODO: fix use coreIndexFileUri instead.... of anchorFileHash
    const {
      coreIndexFileUri,
      numberOfOperations,
    } = AnchoredDataSerializer.deserialize(anchorString);
    const now = new Date();
    await this.executeWithRetry(`INSERT INTO ${this.transactionTable} ?`, {
      ...{
        anchorFileHash: coreIndexFileUri,
        numberOfOperations,
      },
      created: now.getTime(),
      createdHumanReadable: now.toISOString(),
    });
  }

  private toSidetreeTransaction(
    qldbResult: ValueWithMetaData
  ): TransactionModel {
    const { blockAddress, data, metadata } = qldbResult;
    // Block information
    // Using the document id as the transactionTimeHash allows us to perform
    // efficient queries when searching a transaction by transactionTimeHash
    // Indeed querying by document id does not result in a full table scan
    // (similar to querying by an indexed field)
    // See https://docs.aws.amazon.com/qldb/latest/developerguide/working.optimize.html
    const transactionTimeHash = metadata.id.toString();
    // Transaction information
    const transactionTime = Number(blockAddress.sequenceNo);
    const transactionTimestamp = metadata.txTime.getTime();
    // Anchor file information
    // TODO: fix use coreIndexFileUri instead.... of anchorFileHash
    const { anchorFileHash } = data;
    const numberOfOperations = Number(data.numberOfOperations);
    const anchorString = AnchoredDataSerializer.serialize({
      coreIndexFileUri: anchorFileHash,
      numberOfOperations,
    });
    return {
      transactionTime,
      transactionNumber: transactionTime,
      transactionTimeHash,
      transactionTimestamp,
      anchorString,
      transactionFeePaid: 0,
      normalizedTransactionFee: 0,
      writer: 'writer',
    } as any;
  }

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{
    moreTransactions: boolean;
    transactions: TransactionModelQLDB[];
  }> {
    console.log('Starting QLDB read transcation at: ', new Date());
    let result;
    if (sinceTransactionNumber) {
      console.warn(
        'reading since transactionNumber is a costly operation (full table scan), use with caution'
      );
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable} WHERE blockAddress.sequenceNo >= ${sinceTransactionNumber}`
      );
    } else if (transactionTimeHash) {
      console.warn(
        'reading all transactions is a costly operation (full table scan), use with caution'
      );
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable} BY doc_id WHERE doc_id = '${transactionTimeHash}'`
      );
    } else {
      result = await this.executeWithRetry(
        `SELECT * FROM _ql_committed_${this.transactionTable}`
      );
    }
    console.log('QLDB read transcation completed at: ', new Date());
    const resultList: unknown[] = (result as Result).getResultList();
    console.log(
      `There has been ${resultList.length -
        1} new transactions since transaction #${sinceTransactionNumber}`
    );
    const transactions: TransactionModelQLDB[] = (resultList as ValueWithMetaData[]).map(
      this.toSidetreeTransaction
    ) as TransactionModelQLDB[];
    // PartiQL does not support returning sorted data
    // so we have to sort in javascript
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

  // Getting the latest block is a very costly operation in QLDB
  public async getLatestTime(): Promise<BlockchainTimeModel> {
    // IBYRNE - This is used to caluclate getFee, which is always 0, and when checking
    // if blockchain re-org has happened. QLDB is a centralized block chain so it wouldn't
    // ever been re-orged. Returning time value so reorg flag inside Observer.ts is always
    // false.
    return { time: 0, hash: '' };
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
