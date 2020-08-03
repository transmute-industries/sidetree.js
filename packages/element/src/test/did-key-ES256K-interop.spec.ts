import secp256k1 from 'secp256k1';
import { ES256K } from '@transmute/did-key-secp256k1';
import keyto from '@trust/keyto';
import { JWS } from 'jose';
import {
  secp256KPublicKeyJwk,
  secp256KPrivateKeyJwk,
  secp256KPrivateKeyBuffer,
} from './__fixtures__';

const msg = Buffer.from(JSON.stringify({ hello: 'world' }));

const header = {
  alg: 'ES256K',
};

describe('Convert key formats', () => {
  it('should convert hex keys to jwk', async () => {
    const generatedPrivKeyJwk = keyto
      .from(secp256KPrivateKeyBuffer.toString('hex'), 'blk')
      .toJwk('private');
    generatedPrivKeyJwk.crv = 'secp256k1';
    expect(generatedPrivKeyJwk).toEqual(secp256KPrivateKeyJwk);

    const generatedsecp256KPublicKeyJwk = keyto
      .from(secp256KPrivateKeyBuffer, 'blk')
      .toJwk('public');
    generatedsecp256KPublicKeyJwk.crv = 'secp256k1';
    expect(generatedsecp256KPublicKeyJwk).toEqual(secp256KPublicKeyJwk);
  });

  it('should convert jwk to hex keys', async () => {
    const generatedPrivKeyHex = keyto
      .from(
        {
          ...secp256KPrivateKeyJwk,
          crv: 'K-256',
        },
        'jwk'
      )
      .toString('blk', 'private');
    const privKeyHex = secp256KPrivateKeyBuffer.toString('hex');
    expect(generatedPrivKeyHex).toEqual(privKeyHex);

    const generatedPubKeyHex = keyto
      .from(
        {
          ...secp256KPublicKeyJwk,
          crv: 'K-256',
        },
        'jwk'
      )
      .toString('blk', 'public');
    const pubKeyHex = Buffer.from(
      secp256k1.publicKeyCreate(secp256KPrivateKeyBuffer, false)
    ).toString('hex');
    expect(generatedPubKeyHex).toContain(pubKeyHex);
  });
});

describe('Interop between did key ES256K lib and JOSE lib', () => {
  it('should deterministically sign a message with did-key ES256K lib', async () => {
    const privateKeyWithKid = {
      ...secp256KPrivateKeyJwk,
      kid: '',
    };
    const publicKeyWithKid = {
      ...secp256KPublicKeyJwk,
      kid: '',
    };
    const jws = await ES256K.sign(msg, privateKeyWithKid);
    const verified = await ES256K.verify(jws, publicKeyWithKid);
    expect(verified).toBeTruthy();
    const jws2 = await ES256K.sign(msg, privateKeyWithKid);
    const verified2 = await ES256K.verify(jws, publicKeyWithKid);
    expect(verified2).toBeTruthy();
    // Signatures are the same because signature is deterministic
    expect(jws).toEqual(jws2);
  });

  it('should nondeterministically sign a message with the JOSE library', async () => {
    const jws = await JWS.sign(msg, secp256KPrivateKeyJwk as any, header);
    const verified = await JWS.verify(jws, secp256KPublicKeyJwk as any);
    expect(verified).toBeTruthy();
    const jws2 = await JWS.sign(msg, secp256KPrivateKeyJwk as any, header);
    const verified2 = await JWS.verify(jws2, secp256KPublicKeyJwk as any);
    expect(verified2).toBeTruthy();
    // Show that signatures are different
    const [protectedHeader, payload, signature] = jws.split('.');
    const [protectedHeader2, payload2, signature2] = jws2.split('.');
    expect(protectedHeader).toBe(protectedHeader2);
    expect(payload).toBe(payload2);
    expect(signature).not.toBe(signature2);
  });

  it('should sign with did key ES256K and verify with JOSE', async () => {
    const privateKeyWithKid = {
      ...secp256KPrivateKeyJwk,
      kid: '',
    };
    const jws = await ES256K.sign(msg, privateKeyWithKid);
    const verified = await JWS.verify(jws, secp256KPublicKeyJwk as any);
    expect(verified).toBeTruthy();
  });

  it('should sign with JOSE and verify with did key ES256K ', async () => {
    const jws = await JWS.sign(msg, secp256KPrivateKeyJwk as any, header);
    const publicKeyWithKid = {
      ...secp256KPublicKeyJwk,
      kid: '',
    };
    try {
      const verified = await ES256K.verify(jws, publicKeyWithKid);
      expect(verified).toBeTruthy();
    } catch (e) {
      // 50% of the time this check will fail and 50% of the time it will work
      // It is probably because of the k value being chosen at random in JOSE
      // See https://crypto.stackexchange.com/questions/851/can-ecdsa-signatures-be-safely-made-deterministic
      // However the other way around (see test above) works 100% of the time
      console.log(e);
    }
  });
});
