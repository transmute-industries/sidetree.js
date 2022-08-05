/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BlockchainTimeModel,
  IBlockchain,
  ServiceVersionModel,
  TransactionModel,
  ValueTimeLockModel,
} from '@evan.network/sidetree-common';

import { AnchoredDataSerializer } from '@evan.network/sidetree-core';
import moment from 'moment';
import crypto from 'crypto';

let sqlite3: any;
if (process.env.IMPORT_SQLITE === 'true') {
  // This causes nextjs in dashboard to break, this is a workaround to support photon
  sqlite3 = require('sqlite3');
}

const { version } = require('../package.json');

export interface TransactionModelQLDB extends TransactionModel {
  transactionTimestamp: number; // unix timestamp
}

interface MockQldbDriver {
  tableNames: {
    transactionTable: string;
  };
  getTableNames(): string[];
}

export default class MockQLDBLedger implements IBlockchain {
  public qldbDriver: MockQldbDriver;
  public transactionTable: string;
  public approximateTime: BlockchainTimeModel;
  public db: any;

  constructor(tableName: string) {
    this.transactionTable = tableName;
    this.db = new sqlite3.Database(':memory:');
    this.approximateTime = {
      time: 0,
      hash: '',
    };
    this.qldbDriver = {
      tableNames: {
        transactionTable: this.transactionTable,
      },
      getTableNames: () => {
        return Object.values(this.qldbDriver.tableNames);
      },
    };
  }

  private async execute(
    query: string,
    args?: Array<string | number | boolean>
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      args = args || [];
      this.db.all(query, args, (err: any, rows: any[]) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  public async reset(): Promise<void> {
    return;
  }

  public async initialize(): Promise<void> {
    await this.execute(
      `CREATE TABLE ${this.transactionTable} (
          anchorFileHash VARCHAR(50),
          numberOfOperations INT NOT NULL,
          created INT NOT NULL,
          createdHumanReadable VARCHAR(40) NOT NULL,
          PRIMARY KEY (anchorFileHash)
      )`
    );

    await this.execute(
      `CREATE TABLE _ql_committed_${this.transactionTable} (
          doc_id VARCHAR(40),
          blockAddress_sequenceNo INT,
          transactionTime INT NOT NULL UNIQUE,
          transactionNumber INT NOT NULL,
          transactionTimestamp INT NOT NULL,
          anchorString VARCHAR(255) NOT NULL,
          transactionFeePaid INT NOT NULL DEFAULT 0,
          normalizedTransactionFee INT NOT NULL DEFAULT 0,
          writer VARCHAR(40) NOT NULL DEFAULT 'writer',
          PRIMARY KEY(doc_id)
      )`
    );
  }

  public getServiceVersion(): Promise<ServiceVersionModel> {
    return Promise.resolve({
      name: 'mock-qldb',
      version,
    });
  }

  getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  getValueTimeLock(
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return Promise.resolve(undefined);
  }

  getWriterValueTimeLock(): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  public async write(anchorString: string): Promise<void> {
    const { coreIndexFileUri, numberOfOperations } =
      AnchoredDataSerializer.deserialize(anchorString);

    const now = moment();
    const currentDate = now.format('DDHHmmssSSS');
    const transactionTime = parseInt(currentDate);
    const transactionTimestamp = now.valueOf();
    const createdHumanReadable = now.toISOString();

    await this.execute(
      `INSERT INTO ${this.transactionTable} (
          anchorFileHash,
          numberOfOperations,
          created,
          createdHumanReadable
      ) VALUES ( ?, ?, ?, ?)`,
      [
        coreIndexFileUri,
        numberOfOperations,
        transactionTimestamp,
        createdHumanReadable,
      ]
    );

    const transactionTimeHash = crypto
      .createHash('SHA256')
      .update(createdHumanReadable)
      .digest('base64');

    await this.execute(
      `INSERT INTO _ql_committed_${this.transactionTable} (
          doc_id,
          blockAddress_sequenceNo,
          transactionTime,
          transactionNumber,
          transactionTimestamp,
          anchorString
          ) VALUES (
              ?, ?, ?, ?, ?, ?
          )`,
      [
        transactionTimeHash,
        transactionTime,
        transactionTime,
        transactionTime,
        transactionTimestamp,
        anchorString,
      ]
    );

    this.approximateTime = {
      time: transactionTime,
      hash: transactionTimeHash,
    };
  }

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{
    moreTransactions: boolean;
    transactions: TransactionModelQLDB[];
  }> {
    const sql = (() => {
      if (sinceTransactionNumber && transactionTimeHash) {
        return `SELECT
            anchorString,
            normalizedTransactionFee,
            transactionFeePaid,
            transactionNumber,
            transactionTime,
            doc_id AS transactionTimeHash,
            transactionTimestamp,
            writer
            FROM _ql_committed_${this.transactionTable}
            WHERE doc_id = '${transactionTimeHash}'
            AND blockAddress_sequenceNo >= ${sinceTransactionNumber}
            ORDER BY transactionTimestamp DESC`;
      } else if (sinceTransactionNumber) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn(
            'reading since transactionNumber is a costly operation (full table scan), use with caution'
          );
        }
        return `SELECT
            anchorString,
            normalizedTransactionFee,
            transactionFeePaid,
            transactionNumber,
            transactionTime,
            doc_id AS transactionTimeHash,
            transactionTimestamp,
            writer
            FROM _ql_committed_${this.transactionTable}
            WHERE blockAddress_sequenceNo >= ${sinceTransactionNumber}
            ORDER BY transactionTimestamp DESC`;
      } else if (transactionTimeHash) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn(
            'reading all transactions is a costly operation (full table scan), use with caution'
          );
        }
        return `SELECT
            anchorString,
            normalizedTransactionFee,
            transactionFeePaid,
            transactionNumber,
            transactionTime,
            doc_id AS transactionTimeHash,
            transactionTimestamp,
            writer
            FROM _ql_committed_${this.transactionTable}
            WHERE doc_id = '${transactionTimeHash}'
            ORDER BY transactionTimestamp DESC`;
      } else {
        return `SELECT
          anchorString,
          normalizedTransactionFee,
          transactionFeePaid,
          transactionNumber,
          transactionTime,
          doc_id AS transactionTimeHash,
          transactionTimestamp,
          writer
          ORDER BY transactionTimestamp DESC`;
      }
    })();
    const res = await this.execute(sql);

    return {
      moreTransactions: false,
      transactions: res as unknown as TransactionModelQLDB[],
    };
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const [res] = await this.execute(
      `SELECT
          blockAddress_sequenceNo AS time,
          doc_id AS hash
          FROM
          _ql_committed_${this.transactionTable}
          ORDER BY rowid DESC LIMIT 1`
    );
    if (res) {
      this.approximateTime = res as unknown as BlockchainTimeModel;
    }
    return this.approximateTime;
  }
}
