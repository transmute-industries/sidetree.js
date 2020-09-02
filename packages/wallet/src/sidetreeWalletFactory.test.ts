import * as fixtures from './__fixtures__';

import { sidetreeWalletFactory } from './sidetreeWalletFactory';

const wallet = sidetreeWalletFactory.build();
it('can build plugin sidetree from factory', () => {
  const _wallet = sidetreeWalletFactory.build();
  expect(_wallet.generateMnemonic).toBeDefined();
  expect(_wallet.contents).toBeDefined();
});

it('can generateMnemonic', async () => {
  const mnemonic = await wallet.generateMnemonic();
  expect(mnemonic).toBeDefined();
});

it('can generate wallet content from mnemonic and index', async () => {
  const content = await wallet.toSidetreeInitialContent(
    fixtures.wallet_mnemonic_content.value,
    0,
    'elem'
  );
  expect(content[0]).toEqual(fixtures.wallet_mnemonic_content);
  expect(content).toEqual(fixtures.wallet_initial_contents);
});

it('can generate create payload from long from', async () => {
  const create = await wallet.longFormDidToCreateOperation(
    fixtures.wallet_initial_contents[1].id
  );
  expect(create).toEqual(fixtures.wallet_create_operation);
});
