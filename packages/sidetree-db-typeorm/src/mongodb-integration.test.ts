import { createConnection, Connection, getMongoRepository } from 'typeorm';
import 'reflect-metadata';
import { SidetreeTransaction } from './entity/SidetreeTransaction';
import { AnchorFile } from './entity/AnchorFile';

const txn = new SidetreeTransaction(
  89,
  545236,
  '0000000000000000002352597f8ec45c56ad19994808e982f5868c5ff6cfef2e',
  'QmWd5PH6vyRH5kMdzZRPBnf952dbR4av3Bd7B2wBqMaAcf',
  40000,
  100,
  '0af7eccefa3aaa37421914923b4a2034ed5a0ad0'
);

const anchorFile = new AnchorFile('CAS_URI', {});

const entities = [txn, anchorFile];

entities.forEach(entity =>
  describe(entity.constructor.name, () => {
    let connection: Connection;
    let _id: string;

    afterAll(async () => {
      await connection.close();
    });

    it('should create a connection', async () => {
      connection = await createConnection({
        type: 'mongodb',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        url: 'mongodb://localhost:27017/test',
        entities: ['src/entity/**/*.ts'],
      });
      expect(connection.isConnected).toBeTruthy();
      await connection.dropDatabase();
    });

    it('should add an element to the db', async () => {
      const saved = await connection.manager.save(entity);
      expect(saved).toBeDefined();
      expect(saved.constructor).toBe(entity.constructor);
      _id = saved._id!;
    });

    it('should list elements in the db', async () => {
      const found = await connection.manager.find(entity.constructor);
      expect(found.length > 0).toBeTruthy();
    });

    it('should remove an element in the db', async () => {
      const repo = getMongoRepository(entity.constructor);
      const result = await repo.deleteOne({
        _id,
      });
      expect(result.deletedCount).toBe(1);
    });
  })
);
