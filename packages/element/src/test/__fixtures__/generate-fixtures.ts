import {
  AnchorFile,
  ChunkFile,
  CreateOperation,
  MapFile,
  OperationGenerator,
} from '@sidetree/core';
import {
  Config,
  PublicKeyPurpose,
  Multihash,
  JwkCurve25519,
  JwkEs256k,
} from '@sidetree/common';
import { MockCas } from '@sidetree/cas';
import * as fs from 'fs';
import * as bip39 from 'bip39';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';

const keyto = require('@trust/keyto');
const hdkey = require('hdkey');

class FileWriter {
  static write(name: string, content: Buffer | string): void {
    const generatedDir = `${__dirname}/generated`;
    if (name.includes('Buffer.txt')) {
      fs.writeFileSync(`${generatedDir}/${name}`, content.toString('hex'));
    } else {
      fs.writeFileSync(`${generatedDir}/${name}`, content);
    }
  }
}

class KeyGenerator {
  private mnemonic =
    'mosquito sorry ring page rough future world beach pretty calm person arena';

  private counter = 0;

  public async getRandomBuffer(): Promise<Buffer> {
    const seed = await bip39.mnemonicToSeed(this.mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const hdPath = `m/44'/60'/0'/0/${this.counter}`;
    const addrNode = root.derive(hdPath);
    this.counter += 1;
    return addrNode.privateKey;
  }

  public async getEd25519KeyPair(): Promise<[JwkCurve25519, JwkCurve25519]> {
    this.counter += 1;
    const randomBuffer = await this.getRandomBuffer();
    const keyPair = await Ed25519KeyPair.generate({
      seed: randomBuffer,
    });
    const ed25519KeyPair = new Ed25519KeyPair(keyPair);
    const publicKeyJwk = (await ed25519KeyPair.toJwk(false)) as JwkCurve25519;
    const privateKeyJwk = (await ed25519KeyPair.toJwk(true)) as JwkCurve25519;
    return [publicKeyJwk, privateKeyJwk];
  }

  public async getSecp256K1KeyPair(): Promise<[JwkEs256k, JwkEs256k]> {
    this.counter += 1;
    const randomBuffer = await this.getRandomBuffer();
    const publicKeyJwk = keyto.from(randomBuffer, 'blk').toJwk('public');
    publicKeyJwk.crv = 'secp256k1';
    const privateKeyJwk = keyto.from(randomBuffer, 'blk').toJwk('private');
    privateKeyJwk.crv = 'secp256k1';
    return [publicKeyJwk, privateKeyJwk];
  }

  public async getDidDocumentKeyPair(
    id: string
  ): Promise<[any, JwkCurve25519]> {
    const [publicKeyJwk, privateKeyJwk] = await this.getEd25519KeyPair();
    const didDocPublicKey = {
      id,
      type: 'Ed25519VerificationKey2018',
      jwk: publicKeyJwk,
      purpose: [PublicKeyPurpose.Auth, PublicKeyPurpose.General],
    };
    return [didDocPublicKey, privateKeyJwk];
  }
}

let createOperation: CreateOperation;

const config: Config = require('../element-config.json');

const generateDidFixtures = async (): Promise<void> => {
  const keyGenerator = new KeyGenerator();

  const services = OperationGenerator.generateServiceEndpoints([
    'serviceEndpointId123',
  ]);
  const [
    recoveryPublicKey,
    recoveryPrivateKey,
  ] = await keyGenerator.getEd25519KeyPair();
  const [
    signingPublicKey,
    signingPrivateKey,
  ] = await keyGenerator.getDidDocumentKeyPair('key2');
  const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
    recoveryPublicKey,
    signingPublicKey,
    services
  );
  FileWriter.write('createOperationBuffer.txt', createOperationBuffer);
  createOperation = await CreateOperation.parse(createOperationBuffer);

  const didMethodName = config.didMethodName;
  const didUniqueSuffix = createOperation.didUniqueSuffix;
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  FileWriter.write('shortFormDid.txt', shortFormDid);

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
  FileWriter.write('resolveBody.json', JSON.stringify(resolveBody, null, 2));

  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
  FileWriter.write('longFormDid.txt', longFormDid);

  const longFormResolveBody = { ...resolveBody };
  (longFormResolveBody.didDocument['@context'][1] as any)[
    '@base'
  ] = longFormDid;
  longFormResolveBody.didDocument.id = longFormDid;
  FileWriter.write(
    'longFormResolveBody.json',
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

  FileWriter.write('updateOperationBuffer.txt', updateOperationBuffer);
  const deactivateOperation = await OperationGenerator.createDeactivateOperation(
    createOperation.didUniqueSuffix,
    recoveryPrivateKey
  );
  const deactivateOperationBuffer = deactivateOperation.operationBuffer;
  FileWriter.write('deactivateOperationBuffer.txt', deactivateOperationBuffer);

  const [newRecoveryPublicKey] = await keyGenerator.getEd25519KeyPair();
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
  FileWriter.write('recoverOperationBuffer.txt', recoverOperationBuffer);
};

const generateFiles = async (): Promise<void> => {
  // Generate create chunk file fixture
  const createChunkFileBuffer = await ChunkFile.createBuffer(
    [createOperation],
    [],
    []
  );
  const createChunkFile = await ChunkFile.parse(createChunkFileBuffer);
  const createChunkFileHash = await MockCas.getAddress(createChunkFileBuffer);
  FileWriter.write(
    'createChunkFile.json',
    JSON.stringify(createChunkFile, null, 2)
  );
  // Generate create map file fixture
  const createMapFileBuffer = await MapFile.createBuffer(
    createChunkFileHash,
    []
  );
  const createMapFile = await MapFile.parse(createMapFileBuffer);
  const createMapFileHash = await MockCas.getAddress(createMapFileBuffer);
  FileWriter.write(
    'createMapFile.json',
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
  FileWriter.write(
    'createAnchorFile.json',
    JSON.stringify(createAnchorFile, null, 2)
  );
};

const generateKeyFixtures = async (): Promise<void> => {
  const keyGenerator = new KeyGenerator();
  const [
    publicKeyJwk,
    privateKeyJwk,
  ] = await keyGenerator.getSecp256K1KeyPair();
  FileWriter.write(
    'secp256KPublicKeyJwk.json',
    JSON.stringify(publicKeyJwk, null, 2)
  );
  FileWriter.write(
    'secp256KPrivateKeyJwk.json',
    JSON.stringify(privateKeyJwk, null, 2)
  );

  // Get random buffer used to generate the JWKs above ^
  const privateKeyBuffer = await keyGenerator.getRandomBuffer();
  FileWriter.write('secp256KPrivateKeyBuffer.txt', privateKeyBuffer);
};

(async (): Promise<void> => {
  await generateKeyFixtures();
  await generateDidFixtures();
  await generateFiles();
})();
