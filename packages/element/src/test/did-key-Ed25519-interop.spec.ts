import { EdDSA } from '@transmute/did-key-ed25519';
import { JWS } from 'jose';

const msg = Buffer.from(JSON.stringify({ hello: 'world' }));

const header = {
  alg: 'EdDSA',
};

const publicKey = {
  crv: 'Ed25519',
  x: 'h18Gznm3RaMjA-scDPv1FX53HwdxnHZ1_-XMuACNocg',
  kty: 'OKP',
  kid: 'rEJj4jyDHV30s0JBeVFLEthaBpj-1qzd51-sCIjw1L8',
};
const privateKey = {
  crv: 'Ed25519',
  x: 'h18Gznm3RaMjA-scDPv1FX53HwdxnHZ1_-XMuACNocg',
  d: 'MfITzL3pEG3XZwYcyWAtqi3edbpaDQDEVeOpn3avXdE',
  kty: 'OKP',
  kid: 'rEJj4jyDHV30s0JBeVFLEthaBpj-1qzd51-sCIjw1L8',
};

describe('Interop between did key Ed25519 lib and JOSE lib', () => {
  it('should deterministically sign a message with did-key Ed25519 lib', async () => {
    const jws = await EdDSA.sign(msg, privateKey, header);
    const verified = await EdDSA.verify(jws, publicKey);
    expect(verified).toBeTruthy();

    const jws2 = await EdDSA.sign(msg, privateKey, header);
    const verified2 = await EdDSA.verify(jws, publicKey);
    expect(verified2).toBeTruthy();
    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  it('should deterministically sign a message with the JOSE library', async () => {
    const jws = await JWS.sign(msg, privateKey as any, header);
    const verified = await JWS.verify(jws, publicKey as any);
    expect(verified).toBeTruthy();

    const jws2 = await JWS.sign(msg, privateKey as any, header);
    const verified2 = await JWS.verify(jws2, publicKey as any);
    expect(verified2).toBeTruthy();

    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  it('should sign with did key Ed25519 and verify with JOSE', async () => {
    const jws = await EdDSA.sign(msg, privateKey);
    const verified = await JWS.verify(jws, publicKey as any);
    expect(verified).toBeTruthy();
  });

  it('should sign with JOSE and verify with did key Ed25519 ', async () => {
    const jws = await JWS.sign(msg, privateKey as any, header);
    const verified = await EdDSA.verify(jws, publicKey);
    expect(verified).toBeTruthy();
  });
});
