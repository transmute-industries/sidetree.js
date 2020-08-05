const {
  AnchorFile,
  ChunkFile,
  CreateOperation,
  MapFile,
  OperationGenerator,
  Jwk,
} = require('@sidetree/core');
const {
  PublicKeyPurpose,
  Multihash,
} = require('@sidetree/common');
const { MockCas } = require('@sidetree/cas');
const fs = require('fs');

class FileWriter {
  static write(name, content) {
    const generatedDir = `${__dirname}/generated`;
    if (name.includes('Buffer.txt')) {
      fs.writeFileSync(`${generatedDir}/${name}`, content.toString('hex'));
    } else {
      fs.writeFileSync(`${generatedDir}/${name}`, content);
    }
  }
}

class KeyGenerator {
  mnemonic =
    'mosquito sorry ring page rough future world beach pretty calm person arena';

  counter = 0;

  async getEd25519KeyPair() {
    this.counter += 1;
    const [
      publicKeyJwk,
      privateKeyJwk,
    ] = await Jwk.generateDeterministicEd25519KeyPair(
      this.mnemonic,
      this.counter
    );
    return [publicKeyJwk, privateKeyJwk];
  }

  async getPrivateKeyBuffer() {
    return Jwk.getBufferAtIndex(this.mnemonic, this.counter);
  }

  async getSecp256K1KeyPair() {
    this.counter += 1;
    const [
      publicKeyJwk,
      privateKeyJwk,
    ] = await Jwk.generateDeterministicSecp256k1KeyPair(
      this.mnemonic,
      this.counter
    );
    return [publicKeyJwk, privateKeyJwk];
  }

  async getDidDocumentKeyPair(id) {
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

let createOperation;

const config = require('../element-config.json');

const generateDidFixtures = async () => {
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
      update_commitment: createOperation.delta.update_commitment,
    },
  };
  FileWriter.write('resolveBody.json', JSON.stringify(resolveBody, null, 2));

  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
  FileWriter.write('longFormDid.txt', longFormDid);

  const longFormResolveBody = { ...resolveBody };
  (longFormResolveBody.didDocument['@context'][1])[
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

const generateFiles = async () => {
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

const generateKeyFixtures = async () => {
  const keyGenerator = new KeyGenerator();
  // secp256K1 key material
  const [
    secp256KPublicKeyJwk,
    secp256KPrivateKeyJwk,
  ] = await keyGenerator.getSecp256K1KeyPair();
  FileWriter.write(
    'secp256KPublicKeyJwk.json',
    JSON.stringify(secp256KPublicKeyJwk, null, 2)
  );
  FileWriter.write(
    'secp256KPrivateKeyJwk.json',
    JSON.stringify(secp256KPrivateKeyJwk, null, 2)
  );

  // Get random buffer used to generate the JWKs above ^
  const privateKeyBuffer = await keyGenerator.getPrivateKeyBuffer();
  FileWriter.write('secp256KPrivateKeyBuffer.txt', privateKeyBuffer);

  // ed25519 key material
  const [
    ed25519PublicKeyJwk,
    ed25519PrivateKeyJwk,
  ] = await keyGenerator.getEd25519KeyPair();
  FileWriter.write(
    'ed25519PublicKeyJwk.json',
    JSON.stringify(ed25519PublicKeyJwk, null, 2)
  );
  FileWriter.write(
    'ed25519PrivateKeyJwk.json',
    JSON.stringify(ed25519PrivateKeyJwk, null, 2)
  );
};

(async () => {
  await generateKeyFixtures();
  await generateDidFixtures();
  await generateFiles();
})();
