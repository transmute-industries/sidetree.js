# @sidetree/ethereum

Ethereum specific sidetree tooling.

## Deploying the contract to live network (ropsten, mainnet, etc...)

1) Fill in the values in `.env` for production use. Need:
  - funded mnemonic
  - rpc url (use infura)
2) Check that truffle-config.js contains the network you want to deploy to
3) `npx truffle migrate --network ropsten`
