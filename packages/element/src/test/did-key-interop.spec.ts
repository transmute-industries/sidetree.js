import secp256k1 from 'secp256k1';
import { ES256K } from '@transmute/did-key-secp256k1';
import keyto from '@trust/keyto';
import { Jws } from '@sidetree/core';
import base64url from 'base64url';

const msg = Buffer.from(
  'e0cb3d2aa10da7445e52e7131c837ffc8281f0246ceb9d8f3a408d181824724f',
  'hex'
);

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

it('should sign with JOSE and verify with secp256k1 library', async () => {
  const pubKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer);

  // Sanity check, verify that secp256k1 signature can be verified by the secp256k1 lib
  const sigObj = secp256k1.ecdsaSign(msg, privKeyBuffer);
  const verified = secp256k1.ecdsaVerify(sigObj.signature, msg, pubKeyBuffer);
  expect(verified).toBeTruthy();

  // Verify that JWS signature can be verified by the secp256k1 lib
  const jws = await Jws.sign(
    {
      alg: 'ES256K',
    },
    msg,
    privKeyJwk
  );
  const signatureBuffer = base64url.toBuffer(jws.signature);
  const signatureUintArray = new Uint8Array(signatureBuffer);
  const verified2 = secp256k1.ecdsaVerify(
    signatureUintArray,
    msg,
    pubKeyBuffer
  );
  // FIXME: this should pass but does not
  expect(verified2).toBeTruthy();
});

it('should sign with secp256k1 and verify with JOSE library', async () => {
  // Sanity check, verify that JWS signature can be verified by the JWS lib
  const jws = await Jws.sign(
    {
      alg: 'ES256K',
    },
    msg,
    privKeyJwk
  );
  const verify = await Jws.verifySignature(
    base64url.encode(JSON.stringify({ alg: 'ES256K' })),
    base64url.encode(msg),
    jws.signature,
    publicKeyJwk
  );
  expect(verify).toBeTruthy();

  // Verify that secp256k1 signature can be verified by the JWS lib
  const sigObj = secp256k1.ecdsaSign(msg, privKeyBuffer);
  const sigBuffer = Buffer.from(sigObj.signature.buffer);

  const verify2 = await Jws.verifySignature(
    base64url.encode(JSON.stringify({ alg: 'ES256K' })),
    base64url.encode(msg),
    base64url.encode(sigBuffer),
    publicKeyJwk
  );
  // FIXME: this should pass but does not
  expect(verify2).toBeTruthy();
});
