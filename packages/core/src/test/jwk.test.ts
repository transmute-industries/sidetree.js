import Jwk from '../util/Jwk';

jest.setTimeout(60 * 1000);

describe('jwk util', () => {
  it('can generate ed25519 key pair', async () => {
    const keyPair = await Jwk.generateEd25519KeyPair();
    expect(keyPair).toHaveLength(2);
    expect(keyPair[0].kty).toEqual('OKP');
    expect(keyPair[0].crv).toEqual('Ed25519');
    expect(keyPair[0].x).toBeDefined();
    expect(keyPair[1].kty).toEqual('OKP');
    expect(keyPair[1].crv).toEqual('Ed25519');
    expect(keyPair[1].x).toBeDefined();
    expect(keyPair[1].d).toBeDefined();
  });

  it('can generate secp256k1 key pair', async () => {
    const keyPair = await Jwk.generateSecp256k1KeyPair();
    expect(keyPair).toHaveLength(2);
    expect(keyPair[0].kty).toEqual('EC');
    expect(keyPair[0].crv).toEqual('secp256k1');
    expect(keyPair[0].x).toBeDefined();
    expect(keyPair[1].kty).toEqual('EC');
    expect(keyPair[1].crv).toEqual('secp256k1');
    expect(keyPair[1].x).toBeDefined();
    expect(keyPair[1].y).toBeDefined();
    expect(keyPair[1].d).toBeDefined();
  });
});
