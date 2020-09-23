# @sidetree/ethereum

This package contains an implementation of the Sidetree ledger interface on the Ethereum ledger. It passes the test suite defined in `@sidetree/ledger`.

## Usage

```
npm install --save @sidetree/ethereum
```

## Development

```
npm install
npm run test
```

## Deploying the contract to live network (ropsten, mainnet, etc...)

1) Fill in the values in `.env` for production use. Need:
  - funded mnemonic
  - rpc url (use infura)
2) Check that truffle-config.js contains the network you want to deploy to
3) `npx truffle migrate --network ropsten`
