import { fastify, FastifyInstance } from 'fastify';

import { Server, IncomingMessage, ServerResponse } from 'http';

import { registerRoutes } from './routes';

const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify();

registerRoutes(server);

export { server };
