import { FastifyInstance } from 'fastify';

import sidetree from './sidetree';

export const registerRoutes = (server: FastifyInstance) => {
  server.register(sidetree, { prefix: '/sidetree' });
};
