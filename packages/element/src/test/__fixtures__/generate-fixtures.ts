import {
  AnchorFile,
  ChunkFile,
  MapFile,
  OperationGenerator,
  CreateOperation,
  Jwk,
} from '@sidetree/core';
import { Config } from '@sidetree/common';
import { MockCas } from '@sidetree/cas';
import * as fs from 'fs';

const config: Config = require('../element-config.json');
const generateDidFixtures = async () => {
  const [
    recoveryPublicKey,
    recoveryPrivateKey,
  ] = await Jwk.generateEs256kKeyPair();

  const [
    signingPublicKey,
    signingPrivateKey,
  ] = await OperationGenerator.generateKeyPair('key2');

  const services = OperationGenerator.generateServiceEndpoints([
    'serviceEndpointId123',
  ]);
  const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
    recoveryPublicKey,
    signingPublicKey,
    services
  );
  fs.writeFileSync(
    `${__dirname}/createOperationBuffer.txt`,
    createOperationBuffer
  );
  const createOperation = await CreateOperation.parse(createOperationBuffer);

  const didMethodName = config.didMethodName;
  const didUniqueSuffix = createOperation.didUniqueSuffix;
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  fs.writeFileSync(`${__dirname}/shortFormDid.txt`, shortFormDid);

  // Generate create chunk file fixture
  const createChunkFileBuffer = await ChunkFile.createBuffer(
    [createOperation],
    [],
    []
  );
  const createChunkFile = await ChunkFile.parse(createChunkFileBuffer);
  const createChunkFileHash = await MockCas.getAddress(createChunkFileBuffer);
  fs.writeFileSync(`${__dirname}/createChunkFile.json`, JSON.stringify(createChunkFile, null, 2));
  // Generate create map file fixture
  const createMapFileBuffer = await MapFile.createBuffer(
    createChunkFileHash,
    []
  );
  const createMapFile = await MapFile.parse(createMapFileBuffer);
  const createMapFileHash = await MockCas.getAddress(createMapFileBuffer);
  fs.writeFileSync(`${__dirname}/createMapFile.json`, JSON.stringify(createMapFile, null, 2));
  // Generate create anchor file fixture
  const createAnchorFileBuffer = await AnchorFile.createBuffer(
    undefined,
    createMapFileHash,
    [createOperation],
    [],
    []
  );
  const createAnchorFile = await AnchorFile.parse(createAnchorFileBuffer);
  fs.writeFileSync(`${__dirname}/createAnchorFile.json`, JSON.stringify(createAnchorFile, null, 2));

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

  const updateOperation = await OperationGenerator.generateUpdateOperation(
    createOperation.didUniqueSuffix,
    signingPublicKey.jwk,
    signingPrivateKey
  );
  const updateOperationBuffer = updateOperation.operationBuffer;
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

(async () => {
  await generateDidFixtures();
})();
