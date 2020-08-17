import supertest, { SuperTest } from 'supertest';
import { server } from '../server';

let api: SuperTest<any>;

beforeAll(async () => {
  await server.ready();
  api = supertest(server.server);
});

it('is alive', async () => {
  const response = await api
    .get('/status')
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8');
  expect(response.body).toEqual({ ok: true });
});
