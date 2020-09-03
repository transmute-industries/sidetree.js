import { pluginFactory } from './pluginFactory';

it('can plugin sidetree from factory', () => {
  const plugin = pluginFactory.build();
  expect(plugin.generateMnemonic).toBeDefined();
});
