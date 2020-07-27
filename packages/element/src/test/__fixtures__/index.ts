import * as fs from 'fs';

const shortFormDid = fs
  .readFileSync(`${__dirname}/shortFormDid.txt`)
  .toString();
const resolveBody = JSON.parse(
  fs.readFileSync(`${__dirname}/resolveBody.json`).toString()
);
const longFormDid = fs.readFileSync(`${__dirname}/longFormDid.txt`).toString();
const longFormResolveBody = JSON.parse(
  fs.readFileSync(`${__dirname}/longFormResolveBody.json`).toString()
);

// Operation buffers
const createOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/createOperationBuffer.txt`).toString()
);
const updateOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/updateOperationBuffer.txt`).toString()
);
const deactivateOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/deactivateOperationBuffer.txt`).toString()
);
const recoverOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/recoverOperationBuffer.txt`).toString()
);

const createChunkFile = require('./createChunkFile.json');
const createMapFile = require('./createMapFile.json');
const createAnchorFile = require('./createAnchorFile.json');

export {
  createChunkFile,
  createMapFile,
  createAnchorFile,
  shortFormDid,
  resolveBody,
  longFormDid,
  longFormResolveBody,
  createOperationBuffer,
  updateOperationBuffer,
  deactivateOperationBuffer,
  recoverOperationBuffer,
};
