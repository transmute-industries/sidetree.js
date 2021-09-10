const {
    recoverPrivateKeyJwk,
    updatePrivateKeyJwk,
    signingPrivateKeyJwk,
    longFormDid
  } = require('../__fixtures__');
  
  const { operations } = require('@sidetree/wallet');

it('can create LONG_FORM_DID from keys needed for create operation', ()=>{

  const signingPublicKeyJwk = { ...signingPrivateKeyJwk };
  delete signingPublicKeyJwk.d;

  const recoverPublicKeyJwk = { ...recoverPrivateKeyJwk };
  delete recoverPublicKeyJwk.d;

  const updatePublicKeyJwk = { ...updatePrivateKeyJwk };
  delete updatePublicKeyJwk.d;

  const longForm = operations.createLongFormDid({
    method:'ion',
    network: 'mainnet',
    document: {
      "publicKeys": [
        {
          "id": "signing-key",
          "type": "EcdsaSecp256k1VerificationKey2019",
          "publicKeyJwk": signingPublicKeyJwk
        }
      ]
    },
    recoveryKey: recoverPublicKeyJwk,
    updateKey: updatePublicKeyJwk
  })

expect(longForm).toEqual(longFormDid.longFormDid)
});
