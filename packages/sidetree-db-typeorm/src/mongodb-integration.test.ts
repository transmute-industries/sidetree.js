import { createConnection, Connection, getMongoRepository } from 'typeorm';
import 'reflect-metadata';
import { SidetreeTransaction } from './entity/SidetreeTransaction';

jest.setTimeout(20 * 1000);

const txn = new SidetreeTransaction(
  89,
  545236,
  "0000000000000000002352597f8ec45c56ad19994808e982f5868c5ff6cfef2e",
  "QmWd5PH6vyRH5kMdzZRPBnf952dbR4av3Bd7B2wBqMaAcf",
  40000,
  100,
  "0af7eccefa3aaa37421914923b4a2034ed5a0ad0"
);

describe('Show MongoDB integration', () => {
  let connection: Connection;

  afterAll(async () => {
    await connection.close();
  });

  it('should create a connection', async () => {
    connection = await createConnection({
      type: 'mongodb',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      url:
        'mongodb+srv://transmute:y57P%23n2LJ28%21xOkp@transmute-trade-app-yo5pq.gcp.mongodb.net/test?retryWrites=true&w=majority',
      ssl: true,
      entities: ['src/entity/**/*.ts'],
    });
    expect(connection.isConnected).toBeTruthy();
  });

  it('should add an element to the db', async () => {
    const savedTxn = await connection.manager.save(txn);
    expect(savedTxn.transaction_number).toBe(txn.transaction_number);
  });

  it('should list elements in the db', async () => {
    const txns = await connection.manager.find(SidetreeTransaction);
    expect(txns.length > 0).toBeTruthy();
  });

  it('should remove an element in the db', async () => {
    const sidetreeRepo = getMongoRepository(SidetreeTransaction);
    const result = await sidetreeRepo.deleteOne({
      transaction_number: txn.transaction_number,
    });
    expect(result.deletedCount).toBe(1);
  });
});
