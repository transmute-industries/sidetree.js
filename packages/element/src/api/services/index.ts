import fastifyPlugin from 'fastify-plugin';
import { getTestLedger } from '../../test/utils';
import Element from '../../Element';
const config = require('../../test/element-config.json');
const testVersionConfig = require('../../test/element-version-config.json');

async function servicesConnector(fastify: any, _options: any) {
  const ledger = await getTestLedger();
  const element = new Element(config, testVersionConfig, ledger);
  await element.initialize(false, false);

  const services = {
    element,
  };

  fastify.decorate('svcs', services);

  fastify.addHook('onClose', async (_instance: any, done: any) => {
    await element.close();
    done();
  });
}

export const registerServices = (server: any, _options: any) => {
  server.register(fastifyPlugin(servicesConnector), _options);
};
