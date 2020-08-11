import * as fs from 'fs';
import * as path from 'path';

const mnemonic = fs
  .readFileSync(path.resolve(__dirname, './test-vectors/mnemonic.txt'))
  .toString();

const mnemonicContent = JSON.parse(
  fs
    .readFileSync(path.resolve(__dirname, './test-vectors/mnemonic.json'))
    .toString()
);

const initialState = fs
  .readFileSync(path.resolve(__dirname, './test-vectors/initialState.txt'))
  .toString();

const derivedWalletContents = JSON.parse(
  fs
    .readFileSync(
      path.resolve(__dirname, './test-vectors/derivedWalletContents.json')
    )
    .toString()
);

export { mnemonic, mnemonicContent, initialState, derivedWalletContents };
