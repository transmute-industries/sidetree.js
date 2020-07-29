import secp256k1 from 'secp256k1';

it('should deterministically sign a message', async () => {
  const msg = Buffer.from(
    'e0cb3d2aa10da7445e52e7131c837ffc8281f0246ceb9d8f3a408d181824724f',
    'hex'
  );
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
