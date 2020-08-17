import { FastifyInstance } from 'fastify';

import status from './status';

export const registerRoutes = (server: FastifyInstance) => {
  server.register(status, { prefix: '/status' });
};
