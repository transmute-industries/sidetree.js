import * as fs from 'fs';

const shortFormDid = fs
  .readFileSync(`${__dirname}/shortFormDid.txt`)
  .toString();
const createOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/createOperationBuffer.txt`).toString()
);
const deactivateOperationBuffer = Buffer.from(
  fs.readFileSync(`${__dirname}/deactivateOperationBuffer.txt`).toString()
);
const resolveBody = JSON.parse(
  fs.readFileSync(`${__dirname}/resolveBody.json`).toString()
);

const longFormDid = fs.readFileSync(`${__dirname}/longFormDid.txt`).toString();
const longFormResolveBody = JSON.parse(
  fs.readFileSync(`${__dirname}/longFormResolveBody.json`).toString()
);

export {
  shortFormDid,
  createOperationBuffer,
  deactivateOperationBuffer,
  resolveBody,
  longFormDid,
  longFormResolveBody,
};
