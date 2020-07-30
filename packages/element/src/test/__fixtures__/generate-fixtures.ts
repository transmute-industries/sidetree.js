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
import * as bip39 from 'bip39';

const keyto = require('@trust/keyto');
const hdkey = require('hdkey');

export class KeyGenerator {
  private mnemonic =
    'mosquito sorry ring page rough future world beach pretty calm person arena';

  private counter = 0;

  public async getKeyPair() {
    this.counter += 1;
    const seed = await bip39.mnemonicToSeed(this.mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const hdPath = `m/44'/60'/0'/0/${this.counter}`;
    const addrNode = root.derive(hdPath);
    const privateKeyBuffer = addrNode.privateKey;
    const publicKeyJwk = keyto.from(privateKeyBuffer, 'blk').toJwk('public');
    publicKeyJwk.crv = 'secp256k1';
    const privateKeyJwk = keyto.from(privateKeyBuffer, 'blk').toJwk('private');
    privateKeyJwk.crv = 'secp256k1';
    return [publicKeyJwk, privateKeyJwk];
  }

  public async getDidDocumentKeyPair(id: string) {
    const [publicKeyJwk, privateKeyJwk] = await this.getKeyPair();
    const didDocPublicKey = {
      id,
      type: 'EcdsaSecp256k1VerificationKey2019',
      jwk: publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return [didDocPublicKey, privateKeyJwk];
  }
}

let createOperation: CreateOperation;

const config: Config = require('../element-config.json');

const generateDidFixtures = async () => {
  const keyGenerator = new KeyGenerator();

  const services = OperationGenerator.generateServiceEndpoints([
    'serviceEndpointId123',
  ]);
  const [
    recoveryPublicKey,
    recoveryPrivateKey,
  ] = await keyGenerator.getKeyPair();
  const [
    signingPublicKey,
    signingPrivateKey,
  ] = await keyGenerator.getDidDocumentKeyPair('key2');
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

  const [additionalPublicKey] = await keyGenerator.getDidDocumentKeyPair(
    'additional-key'
  );
  const updateOperationJson = await OperationGenerator.createUpdateOperationRequestForAddingAKey(
    didUniqueSuffix,
    signingPublicKey.jwk,
    signingPrivateKey,
    additionalPublicKey,
    Multihash.canonicalizeThenHashThenEncode(additionalPublicKey)
  );

  const updateOperationBuffer = Buffer.from(
    JSON.stringify(updateOperationJson)
  );

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

  const [newRecoveryPublicKey] = await keyGenerator.getKeyPair();
  const [newSigningPublicKey] = await keyGenerator.getDidDocumentKeyPair(
    'newSigningKey'
  );
  const [newAdditionalPublicKey] = await keyGenerator.getDidDocumentKeyPair(
    'newKey'
  );
  const recoverOperationJson = await OperationGenerator.generateRecoverOperationRequest(
    didUniqueSuffix,
    recoveryPrivateKey,
    newRecoveryPublicKey,
    newSigningPublicKey,
    services,
    [newAdditionalPublicKey]
  );

  const recoverOperationBuffer = Buffer.from(
    JSON.stringify(recoverOperationJson)
  );
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
