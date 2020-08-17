import fp from 'fastify-plugin';

export default fp(async (server, _opts, next) => {
  server.route({
    url: '/status',
    logLevel: 'warn',
    method: ['GET', 'HEAD'],
    handler: async (_req, reply) => {
      return reply.send({ ok: true });
    },
  });
  next();
});
