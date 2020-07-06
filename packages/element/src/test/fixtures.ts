import { PublicKeyPurpose } from '@sidetree/common';

// const [
//   recoveryPublicKey,
//   recoveryPrivateKey,
// ] = await Jwk.generateEs256kKeyPair();
const recoveryPublicKey = {
  kty: 'EC',
  crv: 'secp256k1',
  x: '23R2nHS-zvALrRaHR2hQuwPqMG1-1Zf6tB2C-5phxMI',
  y: 'PmzwMQ8XOWukWnjWBpkP1mp8EMj0_QeKXW0KMCfgH58',
};
const recoveryPrivateKey = {
  d: 'nSC2w93tXNqfPTX8ebaHQjjabLs-cYKZY20tGwFx9u8',
  kty: 'EC',
  crv: 'secp256k1',
  x: '23R2nHS-zvALrRaHR2hQuwPqMG1-1Zf6tB2C-5phxMI',
  y: 'PmzwMQ8XOWukWnjWBpkP1mp8EMj0_QeKXW0KMCfgH58',
};

// const [
//   signingPublicKey,
//   signingPrivateKey,
// ] = await OperationGenerator.generateKeyPair('key2');
const signingPublicKey = {
  id: 'key2',
  type: 'EcdsaSecp256k1VerificationKey2019',
  jwk: {
    kty: 'EC',
    crv: 'secp256k1',
    x: '-PMsw7vTbfsBQstqpjNsGn7I2wx9xsHGKDidsxq3SGE',
    y: 'R7htVin32Kal3gjwK3-rj8HecgQPmLiZwSqkdOAQyxg',
  },
  purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
};

const signingPrivateKey = {
  d: '3ODC3tYa5E7gWpc7-ym7VnIHVymkowVArXtfoQwL93g',
  kty: 'EC',
  crv: 'secp256k1',
  x: '-PMsw7vTbfsBQstqpjNsGn7I2wx9xsHGKDidsxq3SGE',
  y: 'R7htVin32Kal3gjwK3-rj8HecgQPmLiZwSqkdOAQyxg',
};

// const services = OperationGenerator.generateServiceEndpoints([
//   'serviceEndpointId123',
// ]);
const services = [
  {
    id: 'serviceEndpointId123',
    type: 'someType',
    endpoint: 'https://www.url.com',
  },
];

const resolveBody = {
  '@context': 'https://www.w3.org/ns/did-resolution/v1',
  didDocument: {
    id: 'did:elem:EiDFzFL-nec0n0x-FSY_AjDIOcbrDdGv1VmA8YWfijAQ-g',
    '@context': [
      'https://www.w3.org/ns/did/v1',
      {
        '@base': 'did:elem:EiDFzFL-nec0n0x-FSY_AjDIOcbrDdGv1VmA8YWfijAQ-g',
      },
    ],
    service: [
      {
        id: '#serviceEndpointId123',
        type: 'someType',
        serviceEndpoint: 'https://www.url.com',
      },
    ],
    publicKey: [
      {
        id: '#key2',
        controller: '',
        type: 'EcdsaSecp256k1VerificationKey2019',
        publicKeyJwk: {
          kty: 'EC',
          crv: 'secp256k1',
          x: '-PMsw7vTbfsBQstqpjNsGn7I2wx9xsHGKDidsxq3SGE',
          y: 'R7htVin32Kal3gjwK3-rj8HecgQPmLiZwSqkdOAQyxg',
        },
      },
    ],
    authentication: ['#key2'],
  },
  methodMetadata: {
    recoveryCommitment: 'EiCF8pulX87bMRp5cQVC6CzhmXR5aTE6BoulhDbCuWGEpg',
    updateCommitment: 'EiDmn_WrhPz7LN2iqtP-w1uQPhi1PuTRNOz6uSfTMVmcXg',
  },
};

export {
  recoveryPublicKey,
  recoveryPrivateKey,
  signingPublicKey,
  signingPrivateKey,
  services,
  resolveBody,
};
