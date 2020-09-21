// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// '0' === Bitcoin... possible default.
// '1' === Test Net (all coins)

export const SIDETREE_BIP44_COIN_TYPE = '1';

export const crvToJwsAlg: any = {
  secp256k1: 'ES256K',
  Ed25519: 'EdDSA',
};
