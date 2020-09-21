// import { keypair } from '../__fixtures__';

import { createSigner } from './createSigner';

const temp = {
  id: '#zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX',
  type: 'JsonWebKey2020',
  controller: 'did:key:zQ3shP2mWsZYWgvgM11nenXRTx9L1yiJKmkf9dfX7NaMKb1pX',
  publicKeyJwk: {
    kty: 'EC',
    crv: 'secp256k1',
    x: 'GBMxavme-AfIVDKqI6WBJ4V5wZItsxJ9muhxPByllHQ',
    y: 'SChlfVBhTXG_sRGc9ZdFeCYzI3Kbph3ivE12OFVk4jo',
  },
  privateKeyJwk: {
    kty: 'EC',
    crv: 'secp256k1',
    d: 'm5N7gTItgWz6udWjuqzJsqX-vksUnxJrNjD5OilScBc',
    x: 'GBMxavme-AfIVDKqI6WBJ4V5wZItsxJ9muhxPByllHQ',
    y: 'SChlfVBhTXG_sRGc9ZdFeCYzI3Kbph3ivE12OFVk4jo',
  },
};

it('createSigner', async () => {
  const signer = await createSigner(temp.privateKeyJwk);
  const signature = await signer.sign(Buffer.from('123'));
  expect(Buffer.from(signature).toString('hex')).toBe(
    '7721a93087d2aefb44338709aa6dc4ecc64eb36a78190751797b90bd779e8d37437875a6159b9dcfc8a1b3e97de1cd85da9d9fb4e439ef587812b3cc11384547'
  );
});
