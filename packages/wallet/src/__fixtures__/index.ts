import { Mnemonic, KeyPair, DidDocument } from '../types';
import { wallet } from '@sidetree/test-vectors';

const {
  mnemonic_fixtures,
  keypair_fixtures,
  did_fixtures,
  sidetree_data_model_fixtures,
} = wallet;

const mnemonic_0 = mnemonic_fixtures.mnemonic_0 as Mnemonic;
const keypair_0 = keypair_fixtures.keypair_0 as KeyPair;
const keypair_1 = keypair_fixtures.keypair_1 as KeyPair;
const did_0 = did_fixtures.did_0 as DidDocument;

export {
  mnemonic_0,
  keypair_0,
  keypair_1,
  did_0,
  sidetree_data_model_fixtures,
};
