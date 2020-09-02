import { toInitialState } from './toInitialState';
import { initialStateToShortFormDid } from './initialStateToShortFormDid';

export const getSidetreeUnanchoredContentFromLinkedDataKeyPair = async (
  secp256k1KeyPair: any,
  didMethod = 'elem'
) => {
  const initialState = await toInitialState(secp256k1KeyPair);
  const shortFormDid = initialStateToShortFormDid(initialState);
  const longFormDid = `${shortFormDid}?-${didMethod}-initial-state=${initialState}`;

  const secp256k1PublicKeyJwk = await secp256k1KeyPair.toJwk();

  secp256k1KeyPair.controller = shortFormDid;
  secp256k1KeyPair.id = '#' + secp256k1PublicKeyJwk.kid;
  delete secp256k1PublicKeyJwk.kid;

  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      {
        '@base': shortFormDid,
      },
    ],
    id: shortFormDid,
    publicKey: [
      {
        id: secp256k1KeyPair.id,
        type: 'JsonWebKey2020',
        controller: shortFormDid,
        publicKeyJwk: secp256k1PublicKeyJwk,
      },
    ],
    authentication: [secp256k1KeyPair.id],
    assertionMethod: [secp256k1KeyPair.id],
    capabilityInvocation: [secp256k1KeyPair.id],
    capabilityDelegation: [secp256k1KeyPair.id],
    // TODO: use ed25519 key pair instead...
    // and support key agreement out of the box.
    // keyAgreement: [secp256k1KeyPair.id],
  };

  return {
    '@context': [
      'https://w3c-ccg.github.io/universal-wallet-interop-spec/contexts/wallet-v1.json',
    ],
    id: longFormDid,
    type: 'DID',
    name: 'Sidetree DID',
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABrUlEQVRYR+2WyYrCQBRFb5x1oQiahRMoCs6Y//8FQXFciAgKziMunI3cB4rSodtdb+qCEMp69U6dKki0arVq4h+jKQBlQBlQBpQBZeDdgN1uRzqdhs1mw3g8xm63QywWQyAQwHq9xmQy+eq1lUwm4fP5sFqtMJ1O4fF4wLHb7YbhcIjj8fha5+NlxOZerxf7/R5+vx+DwQCZTAaLxQLhcBi9Xk/++y2hUAjxeFxqdF1HvV5HPp/H/X7H5XKB2+1Gq9WyBkgkEpjNZnA6ndJ4NBrB5XKJjVwuh+12+7KQzWYFRtM0gSYcQwA2o71yuYxOp4NUKoVutyvNCVOr1awBOBoMBkEQ0zTRaDQEhvqokeRcnOF4sViUec1mU/Q+43A4pBGPlACn00nAotGobJDH8szHEXDX1H69XmEYBvr9vjRnAQvfQzOFQuEHQCQSweFwwGazeVmjIW6A6xHmPR8AJCQpd0MITqYRPjMEmc/n8lwqlbBcLkUrLxx3yvDuUDlreJnb7TYqlYqcP8O1OWZpgIMs4u/Z9KtrbzGJhs7n85/l6pNMGVAGlAFlQBl4AMRZPpDXGOp+AAAAAElFTkSuQmCC',
    description: 'Generated by @sidetree/wallet.',
    tags: [],
    didDocument,
  };
};