import * as fs from 'fs';

const parse = (name: string) => {
  if (name.includes('Buffer.txt')) {
    return Buffer.from(
      fs.readFileSync(`${__dirname}/${name}`).toString()
    );
  }
  if (name.includes('.txt')) {
    return fs.readFileSync(`${__dirname}/${name}`)
      .toString();
  }
  if (name.includes('.json')) {
    return JSON.parse(fs.readFileSync(`${__dirname}/${name}`).toString());
  }
}

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
};
