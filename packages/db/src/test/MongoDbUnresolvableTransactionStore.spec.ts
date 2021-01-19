/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
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

import { TransactionModel } from '@sidetree/common';
import MongoDb from '../MongoDb';
import MongoDbUnresolvableTransactionStore from '../MongoDbUnresolvableTransactionStore';
import { MongoClient } from 'mongodb';
import config from './config-test.json';

/**
 * Creates a MongoDbUnresolvableTransactionStore and initializes it.
 */
async function createIUnresolvableTransactionStore(
  transactionStoreUri: string,
  databaseName: string
): Promise<MongoDbUnresolvableTransactionStore> {
  const unresolvableTransactionStore = new MongoDbUnresolvableTransactionStore(
    transactionStoreUri,
    databaseName,
    1
  );
  await unresolvableTransactionStore.initialize();
  return unresolvableTransactionStore;
}

/**
 * Generates transactions where all the properties are initialized to the 1-based index of the transaction.
 * e.g. First transaction will have all properties assigned as 1 or '1';
 * @param count Number of transactions to generate.
 */
async function generateTransactions(
  count: number
): Promise<TransactionModel[]> {
  const transactions: TransactionModel[] = [];
  for (let i = 1; i <= count; i++) {
    const transaction: TransactionModel = {
      anchorString: i.toString(),
      transactionNumber: i,
      transactionTime: i,
      transactionHash: i.toString(),
      transactionTimeHash: i.toString(),
      transactionFeePaid: 1,
      normalizedTransactionFee: 1,
      writer: 'writer',
    };

    transactions.push(transaction);
  }

  return transactions;
}

describe('MongoDbUnresolvableTransactionStore', () => {
  let mongoServiceAvailable = false;
  let store: MongoDbUnresolvableTransactionStore;
  const collectionName = 'unresolvable-transactions';

  beforeAll(async () => {
    mongoServiceAvailable = await MongoDb.isServerAvailable(
      config.mongoDbConnectionString
    );
    if (mongoServiceAvailable) {
      store = await createIUnresolvableTransactionStore(
        config.mongoDbConnectionString,
        config.databaseName
      );
    }
  });

  beforeEach(async () => {
    await store.clearCollection();
  });

  afterAll(async () => {
    await store.close();
  });

  it('should create collection needed on initialization if they do not exist.', async () => {
    console.info(`Deleting collections...`);
    const client = await MongoClient.connect(config.mongoDbConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(config.databaseName);
    await db.dropCollection(collectionName);

    console.info(`Verify collections no longer exist.`);
    let collections = await db.collections();
    let collectionNames = collections.map(
      (collection) => collection.collectionName
    );
    expect(collectionNames.includes(collectionName)).toBeFalsy();

    console.info(`Trigger initialization.`);
    await store.initialize();

    console.info(`Verify collection exists now.`);
    collections = await db.collections();
    collectionNames = collections.map(
      (collection) => collection.collectionName
    );
    expect(collectionNames.includes(collectionName)).toBeTruthy();
    await client.close();
  });

  it('should record and update unresolvable transactions', async () => {
    const transactionCount = 10;
    const transactions = await generateTransactions(transactionCount);

    // Simulate the first 3 transactions as unresolvable.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
    let unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(3);

    // Simulate the first transaction as failing retry attempt again.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
    unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(3);
    expect(unresolvableTransactions[0].retryAttempts).toEqual(1);
  });

  it('should be able to remove an existing unresolvable transactions', async () => {
    const transactionCount = 10;
    const transactions = await generateTransactions(transactionCount);

    // Simulate the first 3 transactions as unresolvable.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
    let unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(3);

    // Remove the 2nd unresolvable transaction.
    await store.removeUnresolvableTransaction(transactions[1]);
    unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(2);
    // Expect that we can no longer find the originally 2nd unresolvable transaction.
    const unresolvableTransactionNumbers = unresolvableTransactions.map(
      (transaction) => transaction.transactionNumber
    );
    expect(unresolvableTransactionNumbers.includes(2)).toBeFalsy();
  });

  it('should be able to limit the number of unresolvable transactions returned for processing retry.', async () => {
    const transactionCount = 10;
    const transactions = await generateTransactions(transactionCount);

    // Simulate the first 3 transactions as unresolvable.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[0]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[1]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[2]);
    let unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(3);

    // Get only 2 unresolvable transactions due for retry.
    const maxReturnCount = 2;
    let unresolvableTransactionsDueForRetry = await store.getUnresolvableTransactionsDueForRetry(
      maxReturnCount
    );
    expect(unresolvableTransactionsDueForRetry.length).toEqual(2);
    // Simulate successful resolution of the 2 returned transactions and removing them from the store.
    for (const transaction of unresolvableTransactionsDueForRetry) {
      await store.removeUnresolvableTransaction(transaction);
    }
    unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(1);

    // Get remaining 1 unresolvable transaction due for retry.
    unresolvableTransactionsDueForRetry = await store.getUnresolvableTransactionsDueForRetry(
      maxReturnCount
    );
    expect(unresolvableTransactionsDueForRetry.length).toEqual(1);
    // Simulate successful resolution of the 1 returend transaction and removing it from the store.
    for (const transaction of unresolvableTransactionsDueForRetry) {
      await store.removeUnresolvableTransaction(transaction);
    }
    unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(0);
  });

  it('should be able to delete transactions greater than a given transaction time.', async () => {
    const transactionCount = 10;
    const transactions = await generateTransactions(transactionCount);

    // Simulate the transactions 4, 5, 6 as unresolvable.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[3]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[4]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[5]);

    // Deleting all transactions that are later than transaction number 5.
    await store.removeUnresolvableTransactionsLaterThan(5);

    // Expecting only transaction 4 & 5 are unresolvable transactions.
    const unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(2);
    const unresolvableTransactionNumbers = unresolvableTransactions.map(
      (transaction) => transaction.transactionNumber
    );
    expect(unresolvableTransactionNumbers.includes(4)).toBeTruthy();
    expect(unresolvableTransactionNumbers.includes(5)).toBeTruthy();
  });

  it('should be able to delete all transactions.', async () => {
    const transactionCount = 10;
    const transactions = await generateTransactions(transactionCount);

    // Simulate the transactions 4, 5, 6 as unresolvable.
    await store.recordUnresolvableTransactionFetchAttempt(transactions[3]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[4]);
    await store.recordUnresolvableTransactionFetchAttempt(transactions[5]);

    // Deleting all transactions by not passing any argument.
    await store.removeUnresolvableTransactionsLaterThan();

    const unresolvableTransactions = await store.getUnresolvableTransactions();
    expect(unresolvableTransactions.length).toEqual(0);
  });

  it('should default the database name as `sidetree` if not explicitly overriden.', async () => {
    const store = new MongoDbUnresolvableTransactionStore(
      config.mongoDbConnectionString,
      config.databaseName
    );
    expect(store.databaseName).toEqual(config.databaseName);
  });
});
