import {
  AnchorFile,
  ChunkFile,
  CreateOperation,
  MapFile,
  OperationGenerator,
} from '@sidetree/core';
import { Config, PublicKeyPurpose, Multihash } from '@sidetree/common';
import { MockCas } from '@sidetree/cas';
import * as fs from 'fs';

let createOperation: CreateOperation;

const config: Config = require('../element-config.json');
const generateDidFixtures = async () => {
  // const [
  //   recoveryPublicKey,
  //   recoveryPrivateKey,
  // ] = await Jwk.generateEs256kKeyPair();
  const recoveryPublicKey = {
    kty: 'EC',
    crv: 'secp256k1',
    x: 'XvoL6RfcylYRR997IxP3YorX2I8co8TEMyv6k3O-NZw',
    y: '2XDM99zebqzM6TK3ZZMQx4qb8FGfeScE5uRP3_2st0k',
  };
  const recoveryPrivateKey = {
    d: '8vvq3tLi88ImRvY053-RfWW22zqAtrTsD4AUuF3pttU',
    kty: 'EC',
    crv: 'secp256k1',
    x: 'XvoL6RfcylYRR997IxP3YorX2I8co8TEMyv6k3O-NZw',
    y: '2XDM99zebqzM6TK3ZZMQx4qb8FGfeScE5uRP3_2st0k',
  };
  console.log(Boolean(recoveryPrivateKey));

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
      x: '3VR7UmXTSgYur184XWUUFO3stZSiHw8rz2RlEkv8HxU',
      y: 'IttzqtQqCN6AbFmuxkndwcVh59E3ZHWSpNBvLckubYw',
    },
    purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
  };
  const signingPrivateKey = {
    d: '7Z4OWeJgC_bZ1DYnpUVAvegeQjs6UBjKYopGz3YSZNA',
    kty: 'EC',
    crv: 'secp256k1',
    x: '3VR7UmXTSgYur184XWUUFO3stZSiHw8rz2RlEkv8HxU',
    y: 'IttzqtQqCN6AbFmuxkndwcVh59E3ZHWSpNBvLckubYw',
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

  // const additionalKeyId = `additional-key`;
  // const [
  //   additionalPublicKey,
  //   additionalPrivateKey,
  // ] = await OperationGenerator.generateKeyPair(additionalKeyId);
  const additionalPublicKey = {
    id: 'additional-key',
    type: 'EcdsaSecp256k1VerificationKey2019',
    jwk: {
      kty: 'EC',
      crv: 'secp256k1',
      x: 'j1y5BVdvA3dRxBP47BViWfOF3JYixPNDaDHClQbofU0',
      y: 'alJ3bb-lFAL8YGQUnnSBnM_ZbKtRPD7XjFeXy95dBiA',
    },
    purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
  };
  const additionalPrivateKey = {
    d: 'nHF1j2NbnLYKr_LETjECwig2MV_vT825LAjM7GQyn9w',
    kty: 'EC',
    crv: 'secp256k1',
    x: 'j1y5BVdvA3dRxBP47BViWfOF3JYixPNDaDHClQbofU0',
    y: 'alJ3bb-lFAL8YGQUnnSBnM_ZbKtRPD7XjFeXy95dBiA',
  };

  const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
    recoveryPublicKey,
    signingPublicKey,
    services
  );
  fs.writeFileSync(
    `${__dirname}/createOperationBuffer.txt`,
    createOperationBuffer
  );
  createOperation = await CreateOperation.parse(createOperationBuffer);

  const didMethodName = config.didMethodName;
  const didUniqueSuffix = createOperation.didUniqueSuffix;
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  fs.writeFileSync(`${__dirname}/shortFormDid.txt`, shortFormDid);

  const didDocService = [
    {
      id: `#${services[0].id}`,
      serviceEndpoint: services[0].endpoint,
      type: services[0].type,
    },
  ];
  const didDocPublicKey = [
    {
      publicKeyJwk: signingPublicKey.jwk,
      controller: '',
      id: `#${signingPublicKey.id}`,
      type: signingPublicKey.type,
    },
  ];
  const resolveBody = {
    '@context': 'https://www.w3.org/ns/did-resolution/v1',
    didDocument: {
      id: shortFormDid,
      '@context': [
        'https://www.w3.org/ns/did/v1',
        {
          '@base': shortFormDid,
        },
      ],
      service: didDocService,
      publicKey: didDocPublicKey,
      authentication: ['#key2'],
    },
    methodMetadata: {
      recovery_commitment: createOperation.suffixData.recovery_commitment,
      update_commitment: createOperation.delta!.update_commitment,
    },
  };
  fs.writeFileSync(
    `${__dirname}/resolveBody.json`,
    JSON.stringify(resolveBody, null, 2)
  );

  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
  fs.writeFileSync(`${__dirname}/longFormDid.txt`, longFormDid);

  const longFormResolveBody = { ...resolveBody };
  (longFormResolveBody.didDocument['@context'][1] as any)[
    '@base'
  ] = longFormDid;
  longFormResolveBody.didDocument.id = longFormDid;
  fs.writeFileSync(
    `${__dirname}/longFormResolveBody.json`,
    JSON.stringify(longFormResolveBody, null, 2)
  );

  const operationJson = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
    didUniqueSuffix,
    signingPublicKey.jwk,
    signingPrivateKey,
    additionalPublicKey,
    Multihash.canonicalizeThenHashThenEncode(additionalPublicKey)
  );

  const updateOperationBuffer = Buffer.from(JSON.stringify(operationJson));

  fs.writeFileSync(
    `${__dirname}/updateOperationBuffer.txt`,
    updateOperationBuffer
  );
  const deactivateOperation = await OperationGenerator.createDeactivateOperation(
    createOperation.didUniqueSuffix,
    recoveryPrivateKey
  );
  const deactivateOperationBuffer = deactivateOperation.operationBuffer;
  fs.writeFileSync(
    `${__dirname}/deactivateOperationBuffer.txt`,
    deactivateOperationBuffer
  );

  const recoverOperation = await OperationGenerator.generateRecoverOperation({
    didUniqueSuffix: createOperation.didUniqueSuffix,
    recoveryPrivateKey,
  });
  const recoverOperationBuffer = recoverOperation.operationBuffer;
  fs.writeFileSync(
    `${__dirname}/recoverOperationBuffer.txt`,
    recoverOperationBuffer
  );
};

const generateFiles = async () => {
  // Generate create chunk file fixture
  const createChunkFileBuffer = await ChunkFile.createBuffer(
    [createOperation],
    [],
    []
  );
  const createChunkFile = await ChunkFile.parse(createChunkFileBuffer);
  const createChunkFileHash = await MockCas.getAddress(createChunkFileBuffer);
  fs.writeFileSync(
    `${__dirname}/createChunkFile.json`,
    JSON.stringify(createChunkFile, null, 2)
  );
  // Generate create map file fixture
  const createMapFileBuffer = await MapFile.createBuffer(
    createChunkFileHash,
    []
  );
  const createMapFile = await MapFile.parse(createMapFileBuffer);
  const createMapFileHash = await MockCas.getAddress(createMapFileBuffer);
  fs.writeFileSync(
    `${__dirname}/createMapFile.json`,
    JSON.stringify(createMapFile, null, 2)
  );
  // Generate create anchor file fixture
  const createAnchorFileBuffer = await AnchorFile.createBuffer(
    undefined,
    createMapFileHash,
    [createOperation],
    [],
    []
  );
  const createAnchorFile = await AnchorFile.parse(createAnchorFileBuffer);
  fs.writeFileSync(
    `${__dirname}/createAnchorFile.json`,
    JSON.stringify(createAnchorFile, null, 2)
  );
};

(async () => {
  await generateDidFixtures();
  await generateFiles();
})();
