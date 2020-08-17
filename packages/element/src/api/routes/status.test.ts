import { server } from '../server';

import supertest, { SuperTest } from 'supertest';

let api: SuperTest<any>;

beforeAll(async () => {
  await server.ready();
  api = supertest(server.server);
});

afterAll(async () => {
  await server.close();
});

it('is alive', async () => {
  const response = await api
    .get('/status')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');
  expect(response.body).toEqual({ ok: true });
});
