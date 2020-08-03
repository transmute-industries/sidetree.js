import { EdDSA } from '@transmute/did-key-ed25519';
import { JWS } from 'jose';
import { ed25519PublicKeyJwk, ed25519PrivateKeyJwk } from './__fixtures__';

const msg = Buffer.from(JSON.stringify({ hello: 'world' }));

const header = {
  alg: 'EdDSA',
};

describe('Interop between did key Ed25519 lib and JOSE lib', () => {
  it('should deterministically sign a message with did-key Ed25519 lib', async () => {
    const jws = await EdDSA.sign(msg, ed25519PrivateKeyJwk, header);
    const verified = await EdDSA.verify(jws, ed25519PublicKeyJwk);
    expect(verified).toBeTruthy();

    const jws2 = await EdDSA.sign(msg, ed25519PrivateKeyJwk, header);
    const verified2 = await EdDSA.verify(jws, ed25519PublicKeyJwk);
    expect(verified2).toBeTruthy();
    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  it('should deterministically sign a message with the JOSE library', async () => {
    const jws = await JWS.sign(msg, ed25519PrivateKeyJwk as any, header);
    const verified = await JWS.verify(jws, ed25519PublicKeyJwk as any);
    expect(verified).toBeTruthy();

    const jws2 = await JWS.sign(msg, ed25519PrivateKeyJwk as any, header);
    const verified2 = await JWS.verify(jws2, ed25519PublicKeyJwk as any);
    expect(verified2).toBeTruthy();

    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  it('should sign with did key Ed25519 and verify with JOSE', async () => {
    const jws = await EdDSA.sign(msg, ed25519PrivateKeyJwk);
    const verified = await JWS.verify(jws, ed25519PublicKeyJwk as any);
    expect(verified).toBeTruthy();
  });

  it('should sign with JOSE and verify with did key Ed25519 ', async () => {
    const jws = await JWS.sign(msg, ed25519PrivateKeyJwk as any, header);
    const verified = await EdDSA.verify(jws, ed25519PublicKeyJwk);
    expect(verified).toBeTruthy();
  });
});
