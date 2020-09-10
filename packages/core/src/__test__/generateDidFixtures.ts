import { CreateOperation, OperationGenerator } from '../index';

import { Multihash } from '@sidetree/common';

import { FileWriter } from './FileWriter';
import { KeyGenerator } from './KeyGenerator';

let createOperation: any;

const config = require('../../../element/src/test/element-config.json');

export const generateDidFixtures = async () => {
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
    signingPublicKey as any,
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
      publicKeyJwk: (signingPublicKey as any).jwk,
      controller: '',
      id: `#${(signingPublicKey as any).id}`,
      type: (signingPublicKey as any).type,
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
      recoveryCommitment: createOperation.suffixData.recovery_commitment,
      updateCommitment: createOperation.delta.update_commitment,
    },
  };
  FileWriter.write('resolveBody.json', JSON.stringify(resolveBody, null, 2));

  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
  FileWriter.write('longFormDid.txt', longFormDid);

  const longFormResolveBody: any = { ...resolveBody };
  longFormResolveBody.didDocument['@context'][1]['@base'] = longFormDid;
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
    (signingPublicKey as any).jwk,
    signingPrivateKey as any,
    additionalPublicKey as any,
    Multihash.canonicalizeThenHashThenEncode(additionalPublicKey)
  );

  const updateOperationBuffer = Buffer.from(
    JSON.stringify(updateOperationJson)
  );

  FileWriter.write('updateOperationBuffer.txt', updateOperationBuffer);
  const deactivateOperation = await OperationGenerator.createDeactivateOperation(
    createOperation.didUniqueSuffix,
    recoveryPrivateKey as any
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
    recoveryPrivateKey as any,
    newRecoveryPublicKey,
    newSigningPublicKey as any,
    services,
    [newAdditionalPublicKey as any]
  );

  const recoverOperationBuffer = Buffer.from(
    JSON.stringify(recoverOperationJson)
  );
  FileWriter.write('recoverOperationBuffer.txt', recoverOperationBuffer);
};
