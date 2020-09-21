import { pluginFactory } from './pluginFactory';

it('can plugin sidetree from factory', () => {
  const plugin = pluginFactory.build();
  expect(plugin.toMnemonic).toBeDefined();
  expect(plugin.toKeyPair).toBeDefined();

  // support secp256k1
  expect(plugin.toDidDoc).toBeDefined();
  expect(plugin.getCreateOperation).toBeDefined();
  expect(plugin.getRecoverOperation).toBeDefined();

  // support svip
  expect(plugin.toDidDocForProfile).toBeDefined();
  expect(plugin.getCreateOperationForProfile).toBeDefined();
  expect(plugin.getRecoverOperationForProfile).toBeDefined();
});
