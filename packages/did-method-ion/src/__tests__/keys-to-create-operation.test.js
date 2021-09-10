const {
  recoverPrivateKeyJwk,
  updatePrivateKeyJwk,
  signingPrivateKeyJwk,
  createOperation,
} = require('../__fixtures__');

const { methods, operations } = require('@sidetree/wallet');

it('create operation can match ION SDK', () => {


  const recoverPublicKeyJwk = { ...recoverPrivateKeyJwk };
  delete recoverPublicKeyJwk.d;

  const updatePublicKeyJwk = { ...updatePrivateKeyJwk };
  delete updatePublicKeyJwk.d;

  const document = {
    "publicKeys": [
      {
        "id": "signing-key",
        "type": "EcdsaSecp256k1VerificationKey2019",
        "publicKeyJwk": {
          "kty": "EC",
          "crv": "secp256k1",
          "x": "qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0",
          "y": "zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"
        }
      }
    ]}
  const op = operations.create({
    document, 
    updateKey: updatePublicKeyJwk, 
    recoveryKey: recoverPublicKeyJwk 
  })
  expect(op).toEqual(createOperation);
})

describe('can create DID_CREATE_OPERATION from keys', () => {
  it('ION CLI create gives you 3 keys to start', async () => {
    // all 3 keys are different.
    expect(recoverPrivateKeyJwk).not.toEqual(updatePrivateKeyJwk);
    expect(updatePrivateKeyJwk).not.toEqual(signingPrivateKeyJwk);
    expect(signingPrivateKeyJwk).not.toEqual(recoverPrivateKeyJwk);
  });

  describe('suffixData', () => {
    it('the recoveryCommitment is computed from the recoverPublicKeyJwk', async () => {
      const recoverPublicKeyJwk = { ...recoverPrivateKeyJwk };
      delete recoverPublicKeyJwk.d;
      const recoveryCommitment = methods.canonicalizeThenDoubleHashThenEncode(
        recoverPublicKeyJwk
      );
      expect(createOperation.suffixData.recoveryCommitment).toBe(recoveryCommitment);
    });

    it('the deltaHash is computed from the delta', async () => {
      const deltaHash = methods.canonicalizeThenHashThenEncode(
        createOperation.delta
      );
      expect(createOperation.suffixData.deltaHash).toBe(deltaHash);
    });
  })
  
  describe('delta', () => {
    describe('updateCommitment', () => {
      it('the updateCommitment is computed from the updatePublicKeyJwk', async () => {
        const updatePublicKeyJwk = { ...updatePrivateKeyJwk };
        delete updatePublicKeyJwk.d;
        const updateCommitment = methods.canonicalizeThenDoubleHashThenEncode(
          updatePublicKeyJwk
        );
        expect(createOperation.delta.updateCommitment).toBe(updateCommitment);
      });
    });

    describe('patches', () => {
      it('create operation delta.patches is an array which replaces a key', async () => {
        const {
          publicKeyJwk,
        } = createOperation.delta.patches[0].document.publicKeys[0];

        const signingPublicKeyJwk = { ...signingPrivateKeyJwk };
        delete signingPublicKeyJwk.d;
        expect(publicKeyJwk).toEqual(signingPublicKeyJwk);
      });
    });
  });
});
