import * as fs from 'fs';

const longFormDid = fs.readFileSync(`${__dirname}/longFormDid.txt`).toString();
const longFormResolveBody = JSON.parse(
  fs.readFileSync(`${__dirname}/longFormResolveBody.json`).toString()
);

export { longFormDid, longFormResolveBody };
