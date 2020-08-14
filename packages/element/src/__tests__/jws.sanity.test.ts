import { JWS, JWK } from 'jose';
import { ES256K } from '@transmute/did-key-secp256k1';
it('openssl sanity', async () => {
  const revealed_jwk: any = {
    kty: 'EC',
    crv: 'secp256k1',
    x: '8Q0AvZVg1wiYZR1fmE47WLEdM076_uHOnOF6_Tbsw-I',
    y: 'r_xkRvDiWYn-wcxpq83QLaG8aydE8mXJmXW-rEFW2vI',
  };
  const jws =
    'eyJhbGciOiJFUzI1NksifQ.eyJkZWx0YV9oYXNoIjoiRWlEdWFkY21NT2x6djdUejVVQ3BmLXd5VkQ3UHZMM1EyWnQ3Z2pDa0stZjJfdyIsInJlY292ZXJ5X2tleSI6eyJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiI4UTBBdlpWZzF3aVlaUjFmbUU0N1dMRWRNMDc2X3VIT25PRjZfVGJzdy1JIiwieSI6InJfeGtSdkRpV1luLXdjeHBxODNRTGFHOGF5ZEU4bVhKbVhXLXJFRlcydkkifSwicmVjb3ZlcnlfY29tbWl0bWVudCI6IkVpRG1OR3JsRkgwZmU4dUd6bHlDeUYxdUlGMWVadFNVYjVMZGhLelJfOFQtNVEifQ.ksP3xpgfpnhVmtpNF5-RsZCDq4JTzXhC3slp8lM_uyKC_ml5nX5Z7UfwAa0I_PLjinzP5aiVfPYCiCyQYYYP5w';
  const verified_1 = await JWS.verify(jws, JWK.asKey(revealed_jwk));
  const verified_2 = await ES256K.verify(jws, revealed_jwk);
  expect(verified_2).toEqual(verified_1);
});
