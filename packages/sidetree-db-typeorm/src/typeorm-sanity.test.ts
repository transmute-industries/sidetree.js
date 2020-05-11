import { createConnection } from 'typeorm';

import 'reflect-metadata';

import { SidetreeTransaction } from './entity/SidetreeTransaction';

const txn: any = {
  anchorFileHash: 'QmdQHzYSnnNkhEX265RaYqZvYnApFM161nJhL5QwRRbG5f',
  transactionHash:
    '0x0fda998e1f687cf5948c549370f2fe31ab4654d5b06c15f08e66ca5a39fc7aef',
  transactionNumber: 1462,
  transactionTime: 7882238,
  transactionTimeHash:
    '0xd891fd43db18806b3f8e5e1820b6006e328821bbebd2396ca6353bbe5aa53fa8',
  transactionTimestamp: 1589179493,
};

describe('typeorm sanity', () => {
  it('typeorm sanity', async () => {
    const connection = await createConnection();
    const newTxn = new SidetreeTransaction();

    newTxn.transactionNumber = txn.transactionNumber;
    newTxn.transactionHash = txn.transactionHash;
    newTxn.transactionTime = txn.transactionTime;
    newTxn.transactionTimeHash = txn.transactionTimeHash;
    newTxn.transactionTimestamp = txn.transactionTimestamp;
    newTxn.anchorFileHash = txn.anchorFileHash;

    await connection.manager.save(newTxn);
    const txns = await connection.manager.find(SidetreeTransaction);
    expect(txns[0].anchorFileHash).toBe(txn.anchorFileHash);
  });
});
