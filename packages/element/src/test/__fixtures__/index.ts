import * as fs from 'fs';

const generatedDir = `${__dirname}/generated`;

const parse = (name: string) => {
  const content = fs.readFileSync(`${generatedDir}/${name}`).toString();
  if (name.includes('Buffer.txt')) {
    return Buffer.from(content, 'hex');
  }
  if (name.includes('.txt')) {
    return content;
  }
  if (name.includes('.json')) {
    return JSON.parse(content);
  }
};

// DIDs and DID Documents
const shortFormDid = parse('shortFormDid.txt');
const resolveBody = parse('resolveBody.json');
const longFormDid = parse('longFormDid.txt');
const longFormResolveBody = parse('longFormResolveBody.json');

// Operation buffers
const createOperationBuffer = parse('createOperationBuffer.txt');
const updateOperationBuffer = parse('updateOperationBuffer.txt');
const deactivateOperationBuffer = parse('deactivateOperationBuffer.txt');
const recoverOperationBuffer = parse('recoverOperationBuffer.txt');

// Files
const createChunkFile = parse('createChunkFile.json');
const createMapFile = parse('createMapFile.json');
const createAnchorFile = parse('createAnchorFile.json');

// Keys
const publicKeyJwk = parse('publicKeyJwk.json');
const privateKeyJwk = parse('privateKeyJwk.json');
const privateKeyBuffer = parse('privateKeyBuffer.txt');

export {
  createAnchorFile,
  createChunkFile,
  createMapFile,
  createOperationBuffer,
  deactivateOperationBuffer,
  longFormDid,
  longFormResolveBody,
  recoverOperationBuffer,
  resolveBody,
  shortFormDid,
  updateOperationBuffer,
  publicKeyJwk,
  privateKeyJwk,
  privateKeyBuffer,
};
