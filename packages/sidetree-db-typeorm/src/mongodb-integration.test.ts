import { createConnection, Connection, getMongoRepository } from 'typeorm';
import 'reflect-metadata';
import { SidetreeTransaction } from './entity/SidetreeTransaction';

jest.setTimeout(20 * 1000);

const txn = new SidetreeTransaction(
  1462,
  '0x0fda998e1f687cf5948c549370f2fe31ab4654d5b06c15f08e66ca5a39fc7aef',
  7882238,
  '0xd891fd43db18806b3f8e5e1820b6006e328821bbebd2396ca6353bbe5aa53fa8',
  1589179493,
  'QmdQHzYSnnNkhEX265RaYqZvYnApFM161nJhL5QwRRbG5f',
);

describe('Show MongoDB integration', () => {
  let connection: Connection;

  afterAll(async () => {
    await connection.close()
  });

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
    expect(connection.isConnected).toBeTruthy();
  });

  it('should add an element to the db', async () => {
    const savedTxn = await connection.manager.save(txn);
    expect(savedTxn.transactionHash).toBe(txn.transactionHash);
  });

  it('should list elements in the db', async () => {
     const txns = await connection.manager.find(SidetreeTransaction);
     expect(txns.length > 0).toBeTruthy();
  });

  it('should remove an element in the db', async () => {
    const sidetreeRepo = getMongoRepository(SidetreeTransaction);
    const result = await sidetreeRepo.deleteOne({ transactionHash: txn.transactionHash });
    expect(result.deletedCount).toBe(1);
  })
});
