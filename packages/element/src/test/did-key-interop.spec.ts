import secp256k1 from 'secp256k1';
import keyto from '@trust/keyto';
import { Jws } from '@sidetree/core';

const msg = Buffer.from(
  'e0cb3d2aa10da7445e52e7131c837ffc8281f0246ceb9d8f3a408d181824724f',
  'hex'
);

it('should deterministically sign a message with the secp256k1 library', async () => {
  const privKey = Buffer.from(
    '77d5b3ac2c9bf0f11fe3eca90102f2a2adcf5285f2e0fc4b936dae17b33fece5',
    'hex'
  );
  const pubKey = secp256k1.publicKeyCreate(privKey);
  const sigObj = secp256k1.ecdsaSign(msg, privKey);

  expect(sigObj.signature.toString()).toEqual(
    '93,1,81,185,221,191,130,146,188,160,194,22,68,101,164,242,90,169,53,35,56,104,146,45,244,150,85,218,189,87,7,90,103,239,178,217,186,78,14,211,238,94,127,188,200,233,106,104,100,234,77,181,63,176,214,202,76,142,127,204,43,143,11,133'
  );
  expect(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey)).toBeTruthy();
});

it('should nondeterministically sign a message with the JOSE library', async () => {
  const privKey = Buffer.from(
    '77d5b3ac2c9bf0f11fe3eca90102f2a2adcf5285f2e0fc4b936dae17b33fece5',
    'hex'
  );
  const privKeyJwk = keyto.from(privKey, 'blk').toJwk('private');
  privKeyJwk.crv = 'secp256k1';
  const publicKeyJwk = keyto.from(privKey, 'blk').toJwk('public');
  publicKeyJwk.crv = 'secp256k1';
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
