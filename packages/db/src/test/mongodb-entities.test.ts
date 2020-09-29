/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/master/reference-implementation-changes.md
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

import { createConnection, Connection, getMongoRepository } from 'typeorm';
import 'reflect-metadata';
import fixtures from './__fixtures__';

fixtures.forEach((fixture) =>
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
