import { createConnection } from 'typeorm';

import 'reflect-metadata';

jest.setTimeout(20 * 1000);

describe('Show MongoDB integration', () => {
  let connection;

  it('should create a connection', async () => {
    connection = await createConnection({
      "type": "mongodb",
      "useNewUrlParser": true,
      "useUnifiedTopology": true,
      "url": "mongodb+srv://transmute:y57P%23n2LJ28%21xOkp@transmute-trade-app-yo5pq.gcp.mongodb.net/test?retryWrites=true&w=majority",
      "ssl": true,
      "entities": [
          "src/entity/**/*.ts"
      ]
    });
    console.log({ connection });
  });

  // it('lol', async () => {
  //   console.log({ connection });
  //   const newTxn = new SidetreeTransaction();

  //   newTxn.transactionNumber = txn.transactionNumber;
  //   newTxn.transactionHash = txn.transactionHash;
  //   newTxn.transactionTime = txn.transactionTime;
  //   newTxn.transactionTimeHash = txn.transactionTimeHash;
  //   newTxn.transactionTimestamp = txn.transactionTimestamp;
  //   newTxn.anchorFileHash = txn.anchorFileHash;
  //   console.log({ newTxn });

  //   await connection.manager.save(newTxn).catch(console.error)
  //   const txns = await connection.manager.find(SidetreeTransaction);
  //   console.log({ txns });
  //   expect(txns[0].anchorFileHash).toBe(txn.anchorFileHash);
  // })
});
