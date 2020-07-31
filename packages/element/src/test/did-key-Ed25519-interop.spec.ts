import { EdDSA } from '@transmute/did-key-ed25519';
import { Jwk } from '@sidetree/core';
// import { JWS } from 'jose';

const msg = Buffer.from(JSON.stringify({ hello: 'world' }));

const header = {
  alg: 'EdDSA',
};

describe('Interop between did key Ed25519 lib and JOSE lib', () => {
  it('should deterministically sign a message with did-key Ed25519 lib', async () => {
    const [publicKey, privateKey] = await Jwk.generateEd25519KeyPair();

    const jws = await EdDSA.sign(msg, privateKey, header);
    const verified = await EdDSA.verify(jws, publicKey);
    expect(verified).toBeTruthy();

    const jws2 = await EdDSA.sign(msg, privateKey, header);
    const verified2 = await EdDSA.verify(jws, publicKey);
    expect(verified2).toBeTruthy();
    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  // it('should nondeterministically sign a message with the JOSE library', async () => {
  //   const jws = await JWS.sign(msg, privateKeyJwk as any, header);
  //   const verified = await JWS.verify(jws, publicKeyJwk as any);
  //   expect(verified).toBeTruthy();
  //   const jws2 = await JWS.sign(msg, privateKeyJwk as any, header);
  //   const verified2 = await JWS.verify(jws2, publicKeyJwk as any);
  //   expect(verified2).toBeTruthy();
  //   // Show that signatures are different
  //   const [protectedHeader, payload, signature] = jws.split('.');
  //   const [protectedHeader2, payload2, signature2] = jws2.split('.');
  //   expect(protectedHeader).toBe(protectedHeader2);
  //   expect(payload).toBe(payload2);
  //   expect(signature).not.toBe(signature2);
  // });

  // it('should sign with did key ES256K and verify with JOSE', async () => {
  //   const privateKeyWithKid = {
  //     ...privateKeyJwk,
  //     kid: '',
  //   };
  //   const jws = await ES256K.sign(msg, privateKeyWithKid);
  //   const verified = await JWS.verify(jws, publicKeyJwk as any);
  //   expect(verified).toBeTruthy();
  // });

  // it('should sign with JOSE and verify with did key ES256K ', async () => {
  //   const jws = await JWS.sign(msg, privateKeyJwk as any, header);
  //   const publicKeyWithKid = {
  //     ...publicKeyJwk,
  //     kid: '',
  //   };
  //   try {
  //     const verified = await ES256K.verify(jws, publicKeyWithKid);
  //     expect(verified).toBeTruthy();
  //   } catch (e) {
  //     // 50% of the time this check will fail and 50% of the time it will work
  //     // It is probably because of the k value being chosen at random in JOSE
  //     // See https://crypto.stackexchange.com/questions/851/can-ecdsa-signatures-be-safely-made-deterministic
  //     // However the other way around (see test above) works 100% of the time
  //     console.log(e);
  //   }
  // });
});
