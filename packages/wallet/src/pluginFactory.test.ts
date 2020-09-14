import { pluginFactory } from './pluginFactory';

it('can plugin sidetree from factory', () => {
  const plugin = pluginFactory.build();
  expect(plugin.toMnemonic).toBeDefined();
  expect(plugin.toKeyPair).toBeDefined();
  expect(plugin.toDidDoc).toBeDefined();
});
