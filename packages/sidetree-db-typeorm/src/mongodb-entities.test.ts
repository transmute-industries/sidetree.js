import { createConnection, Connection, getMongoRepository } from 'typeorm';
import 'reflect-metadata';
import fixtures from './__fixtures__';

fixtures.forEach(fixture =>
  describe(fixture.name, () => {
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
      const saved = await connection.manager.save(fixture.entity);
      expect(saved).toBeDefined();
      expect(saved.constructor).toBe(fixture.entity.constructor);
      _id = saved._id!;
    });

    it('should list elements in the db', async () => {
      const found = await connection.manager.find(fixture.entity.constructor);
      expect(found).toHaveLength(1);
    });

    it('should remove an element in the db', async () => {
      const repo = getMongoRepository(fixture.entity.constructor);
      const result = await repo.deleteOne({
        _id,
      });
      expect(result.deletedCount).toBe(1);
    });
  })
);
