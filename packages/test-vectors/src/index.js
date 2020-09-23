const testVectors = require('./dif-sidetree-test-vectors');
const filesystem = require('./filesystem');
const crypto = require('./crypto');
const sidetreeUniversalWallet = require('./sidetree-universal-wallet');
const sidetreeCoreGeneratedSecp256k1 = require('./core-generated-secp256k1');
const sidetreeCoreGeneratedEd25519 = require('./core-generated-ed25519');

module.exports = {
  testVectors, // OK
  filesystem, // OK
  crypto, // OK
  sidetreeUniversalWallet, // Ok
  sidetreeCoreGeneratedSecp256k1, // OK
  sidetreeCoreGeneratedEd25519, // OK
};
