import { server } from '../server';

import supertest, { SuperTest } from 'supertest';

import { testVectors, apiTestVectors } from '../../__fixtures__';
import { resetDatabase, replaceMethod } from '../../test/utils';

let api: SuperTest<any>;

beforeAll(async () => {
  await resetDatabase();
  await server.ready();
  api = supertest(server.server);
});

afterAll(async () => {
  await server.close();
});

it('versions', async () => {
  const response = await api
    .get('/sidetree/versions')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');
  expect(response.body).toEqual(apiTestVectors.responses.versions);
});

it('operations', async () => {
  const response = await api
    .post('/sidetree/operations')
    .send(testVectors.create.createRequest)
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');
  expect(replaceMethod(response.body)).toEqual(
    testVectors.create.createResponse
  );
});
