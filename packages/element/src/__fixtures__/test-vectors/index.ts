import * as fs from 'fs';

const updateKeySeed = fs
  .readFileSync(`${__dirname}/updateKeySeed.txt`)
  .toString();
const recoveryKeySeed = fs
  .readFileSync(`${__dirname}/recoveryKeySeed.txt`)
  .toString();

const createOperationRequest = fs
  .readFileSync(`${__dirname}/createOperationRequest.json`)
  .toString();

const shortFormDid = fs
  .readFileSync(`${__dirname}/shortFormDid.txt`)
  .toString();

const longFormDid = fs.readFileSync(`${__dirname}/longFormDid.txt`).toString();

const longFormResolveBody = fs
  .readFileSync(`${__dirname}/longFormResolveBody.json`)
  .toString();

const resolveBodyAfterCreate = fs
  .readFileSync(`${__dirname}/resolveBodyAfterCreate.json`)
  .toString();

const updateOperationRequest = fs
  .readFileSync(`${__dirname}/updateOperationRequest.json`)
  .toString();

const updateResponseBody = fs
  .readFileSync(`${__dirname}/updateResponseBody.json`)
  .toString();



export {
  updateKeySeed,
  recoveryKeySeed,
  createOperationRequest,
  shortFormDid,
  longFormDid,
  longFormResolveBody,
  resolveBodyAfterCreate,
  updateOperationRequest,
  updateResponseBody
};
