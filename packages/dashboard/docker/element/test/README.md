### Element on Ropsten

🚧 Be especially cautious not to reuse secrets between environments.

Its important to be able to develop and test blockchain and distributed services with 100% remote dependencies.

These instructions cover setting up and testing element with cloud services.

### Configuration

Treat all public testnet's and associated software exactly as you would a prodction blockchain environment.

You MUST make changes to `element.test.env`.

NEVER commit a file containing secrets for services you are using.

If you accidentally commit secret values, take IMMEDIATE action.

1. transfer all crypto currencies and assets such as NFTs associated with the compromised address.
2. reset any account credentials which may be compromised.

#### Required Changes

##### ELEMENT ANCHOR CONTRACT ADDRESS

The `did:elem:ropsten` Method smart contract address is:

- [ropsten.etherscan.io/address/0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997](https://ropsten.etherscan.io/address/0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997)

This address MUST NOT be changed.

If this address is changed, the associated DID Method MUST NOT be referred to as `did:elem:ropsten`.

##### MNEMONIC

NEVER reuse a mnemonic between environments or apps.

This phrase can be generated according to [BIP 39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

This secret value is used to generate the smart contract signing key associated with anchor events in element.

Accounts associated with this secret should be minimally funded.

##### ETHEREUM PROVIDER

We recommend you not attempt to operate and secure ethereum nodes.

Instead use a service such as [INFURA](https://infura.io/).

This URI is required for reading and writing from the etherum network.

##### MONGO DB CONNECTION STRING

We recommend you not attempt to operate and secure mongo db instances.

Instead use a service such as [MongoDB Atlas](https://www.mongodb.com/atlas/database).

This URI is required for caching all data associated with IPFS and Ethereum,
and for assisting in sidetree batching.

... TODO ... cover 100% of requires configuration changes ...

### Running

You can change the evironment file that will be used by docker-compose,
we recommend not changing any values of the file associated with
running element in a development configuration.

From the root directory of sidetree.js:

```bash
docker-compose \
--file ./packages/dashboard/docker/element/dev/docker-compose.element.dev.yml  \
--env-file ./packages/dashboard/docker/element/dev/element.dev.env up
```

Or via npm:

```
npm run element:dev
```
