import fp from 'fastify-plugin';

export default fp(async (server, _opts, next) => {
  server.route({
    url: '/sidetree/versions',
    logLevel: 'warn',
    method: ['GET', 'HEAD'],
    handler: async (_req, reply) => {
      const result = await (server as any).svcs.element.handleGetVersionRequest();
      if (result.status === 'succeeded') {
        return reply.send(JSON.parse(result.body));
      }
      return reply.status(500).send(JSON.parse(result.body));
    },
  });

  server.route({
    url: '/sidetree/operations',
    logLevel: 'warn',
    method: ['POST', 'HEAD'],
    handler: async (_req, reply) => {
      const { body } = _req;
      const result = await (server as any).svcs.element.handleOperationRequest(
        Buffer.from(JSON.stringify(body))
      );
      if (result.status === 'succeeded') {
        return reply.send(result.body);
      }
      return reply.status(500).send(JSON.parse(result.body));
    },
  });
  next();
});
