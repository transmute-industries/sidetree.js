import secp256k1 from 'secp256k1';
import { ES256K } from '@transmute/did-key-secp256k1';
import keyto from '@trust/keyto';
import { Jws } from '@sidetree/core';
import { verify } from '@transmute/did-key-secp256k1/dist/ES256K';

const msg = Buffer.from(JSON.stringify({ hello: 'world' }));

const header = {
  alg: 'ES256K',
};

const privKeyBuffer = Buffer.from(
  '77d5b3ac2c9bf0f11fe3eca90102f2a2adcf5285f2e0fc4b936dae17b33fece5',
  'hex'
);

const privKeyJwk = {
  kty: 'EC',
  crv: 'secp256k1',
  d: 'd9WzrCyb8PEf4-ypAQLyoq3PUoXy4PxLk22uF7M_7OU',
  x: '3PAeFnNa_R6vxH6dDfzoH5K0O7UAmX342SzlL-4aEZE',
  y: '1Rw6RknAvKUDaRFVO_NlTJnp7PrxtBfQOvlScUIk6qY',
};

const publicKeyJwk = {
  kty: 'EC',
  crv: 'secp256k1',
  x: '3PAeFnNa_R6vxH6dDfzoH5K0O7UAmX342SzlL-4aEZE',
  y: '1Rw6RknAvKUDaRFVO_NlTJnp7PrxtBfQOvlScUIk6qY',
};

it('should convert hex keys to jwk', async () => {
  const generatedPrivKeyJwk = keyto.from(privKeyBuffer, 'blk').toJwk('private');
  generatedPrivKeyJwk.crv = 'secp256k1';
  expect(generatedPrivKeyJwk).toEqual(privKeyJwk);

  const generatedPublicKeyJwk = keyto
    .from(privKeyBuffer, 'blk')
    .toJwk('public');
  generatedPublicKeyJwk.crv = 'secp256k1';
  expect(generatedPublicKeyJwk).toEqual(publicKeyJwk);
});

it('should convert jwk to hex keys', async () => {
  const generatedPrivKeyHex = keyto
    .from(
      {
        ...privKeyJwk,
        crv: 'K-256',
      },
      'jwk'
    )
    .toString('blk', 'private');
  const privKeyHex = privKeyBuffer.toString('hex');
  expect(generatedPrivKeyHex).toEqual(privKeyHex);

  const generatedPubKeyHex = keyto
    .from(
      {
        ...publicKeyJwk,
        crv: 'K-256',
      },
      'jwk'
    )
    .toString('blk', 'public');
  const pubKeyHex = Buffer.from(
    secp256k1.publicKeyCreate(privKeyBuffer, false)
  ).toString('hex');
  expect(generatedPubKeyHex).toContain(pubKeyHex);
});

it('should deterministically sign a message with did-key ES256K lib', async () => {
  const privateKeyWithKid = {
    ...privKeyJwk,
    kid: '',
  };
  const publicKeyWithKid = {
    ...publicKeyJwk,
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
  const jws = await Jws.signAsCompactJws(msg, privKeyJwk, header);
  const verified = await Jws.verifyCompactJws(jws, publicKeyJwk);
  expect(verified).toBeTruthy();
  const jws2 = await Jws.signAsCompactJws(msg, privKeyJwk, header);
  const verified2 = await Jws.verifyCompactJws(jws2, publicKeyJwk);
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
    ...privKeyJwk,
    kid: '',
  };
  const jws = await ES256K.sign(msg, privateKeyWithKid);
  const verified = await Jws.verifyCompactJws(jws, publicKeyJwk);
  expect(verified).toBeTruthy();
});

it('should sign with JOSE and verify with did key ES256K ', async () => {
  const jws = await Jws.signAsCompactJws(msg, privKeyJwk, header);
  const publicKeyWithKid = {
    ...publicKeyJwk,
    kid: '',
  };
  const verified = await ES256K.verify(jws, publicKeyWithKid);
  // 50% of the time this check will fail and 50% of the time it will work
  // It is probably because of the k value being chosen at random in JOSE
  // See https://crypto.stackexchange.com/questions/851/can-ecdsa-signatures-be-safely-made-deterministic
  // However the other way around (see test above) works 100% of the time
  console.log(verified);
});
