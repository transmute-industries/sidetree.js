import secp256k1 from 'secp256k1';
import keyto from '@trust/keyto';
import { Jws } from '@sidetree/core';
import base64url from 'base64url';

const msg = Buffer.from(
  'e0cb3d2aa10da7445e52e7131c837ffc8281f0246ceb9d8f3a408d181824724f',
  'hex'
);
const privKeyHex = Buffer.from(
  '77d5b3ac2c9bf0f11fe3eca90102f2a2adcf5285f2e0fc4b936dae17b33fece5',
  'hex'
);
const pubKeyHex = secp256k1.publicKeyCreate(privKeyHex);

const privKeyJwk = keyto.from(privKeyHex, 'blk').toJwk('private');
privKeyJwk.crv = 'secp256k1';

const publicKeyJwk = keyto.from(privKeyHex, 'blk').toJwk('public');
publicKeyJwk.crv = 'secp256k1';

it('should deterministically sign a message with the secp256k1 library', async () => {
  const sigObj = secp256k1.ecdsaSign(msg, privKeyHex);
  expect(sigObj.signature.toString()).toEqual(
    '93,1,81,185,221,191,130,146,188,160,194,22,68,101,164,242,90,169,53,35,56,104,146,45,244,150,85,218,189,87,7,90,103,239,178,217,186,78,14,211,238,94,127,188,200,233,106,104,100,234,77,181,63,176,214,202,76,142,127,204,43,143,11,133'
  );
  expect(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKeyHex)).toBeTruthy();
});

it('should nondeterministically sign a message with the JOSE library', async () => {
  const jws = await Jws.sign(
    {
      alg: 'ES256K',
    },
    msg,
    privKeyJwk
  );
  const verify = await Jws.verifySignature(
    jws.protected,
    jws.payload,
    jws.signature,
    publicKeyJwk
  );
  expect(verify).toBeTruthy();
  const jws2 = await Jws.sign(
    {
      alg: 'ES256K',
    },
    msg,
    privKeyJwk
  );
  const verify2 = await Jws.verifySignature(
    jws2.protected,
    jws2.payload,
    jws2.signature,
    publicKeyJwk
  );
  expect(verify2).toBeTruthy();
  // Show that signatures are different
  expect(jws.protected).toBe(jws2.protected);
  expect(jws.payload).toBe(jws2.payload);
  expect(jws.signature).not.toBe(jws2.signature);
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
  const sigObj = secp256k1.ecdsaSign(msg, privKeyHex);
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
