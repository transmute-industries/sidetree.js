import { Mnemonic, KeyPair, DidDocument } from '../types';
import { wallet } from '@sidetree/test-vectors';

const { mnemonic, keypair, did, sidetree } = wallet;

const mnemonic_0 = mnemonic.mnemonic_0 as Mnemonic;
const keypair_0 = keypair.keypair_0 as KeyPair;
const keypair_1 = keypair.keypair_1 as KeyPair;
const did_0 = did.did_0 as DidDocument;

export { mnemonic_0, keypair_0, keypair_1, did_0, sidetree };
