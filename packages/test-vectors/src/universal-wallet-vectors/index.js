const fs = require('fs');
const path = require('path');

const mnemonic = fs
  .readFileSync(path.resolve(__dirname, './mnemonic.txt'))
  .toString();

const mnemonicContent = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './mnemonic.json')).toString()
);

const createResponse = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './createResponse.json')).toString()
);

const initialState = fs
  .readFileSync(path.resolve(__dirname, './initialState.txt'))
  .toString();

const derivedWalletContents = JSON.parse(
  fs
    .readFileSync(path.resolve(__dirname, './derivedWalletContents.json'))
    .toString()
);

module.exports = {
  mnemonic,
  mnemonicContent,
  initialState,
  derivedWalletContents,
  createResponse,
};
