# @sidetree/element

This package contains an implementation of Sidetree Core, using Ethereum and IPFS

## Run Tests

This package provides a series of tests, which act as a reference for the functionality for Element.
The tests can be run by cloning this repository with the following commands.

```
$ git clone https://github.com/transmute-industries/sidetree.js.git
$ cd sidetree.js/packages/did-method-element
$ npm install
$ npm run test
```

## Set Up a Node

Instructions for setting up an Element node are defined in the following documents.

- [Install Local Development with Ganache](docs/local-dev.md)
- [Install Testnet Development with Ropsten](docs/local-element-ropsten-install.md)

## As a Library

This package is published to NPM and can be included in your own projects with

```
npm install @sidetree/element --save
```

## Element DID Method Specification

Element is an implementation of the Sidetree Protocol that uses the Ethereum blockchain as the ledger layer and IPFS as the content-addressable storage layer
For more information, see [the sidetree spec](https://identity.foundation/sidetree/spec/)

## Method syntax

The namestring identifying this did method is `elem`
A DID that uses this method MUST begin with the following prefix: `did:elem`. Per the DID specification, this string MUST be in lowercase.

An additional optional network specific identifier may be added as such

- `did:elem:ropsten:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`
- `did:elem:mainnet:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`
- `did:elem:EiBOWH8368BI9NSaVZTmtxuqwpfN9NwAwy4Z95_VCl6A9g`

By default, if the network specific identifier is not present, then the default is `mainnet`.
The remainder of a DID after the prefix, called the did unique suffix, MUST be a `SHA256` hash of the encoded create payload (see below)

## Parameters

Element follows the default parameters defined in the [Sidetree Protocol Specificaltion](https://identity.foundation/sidetree/spec/#default-parameters).

| Element Parameter               | Element Default                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------- |
| HASH_ALGORITHM                  | SHA256                                                                            |
| HASH_PROTOCOL                   | [Multihash](https://multiformats.io/multihash/)                                   |
| DATA_ENCODING_SCHEME            | Base64URL                                                                         |
| JSON_CANONICALIZATION_SCHEME    | [JCS](https://tools.ietf.org/html/draft-rundgren-json-canonicalization-scheme-17) |
| KEY_ALGORITHM                   | secp256k1                                                                         |
| SIGNATURE_ALGORITHM             | ES256K                                                                            |
| CAS_PROTOCOL                    | [IPFS](https://github.com/ipfs/specs)                                             |
| CAS_URI_ALGORITHM               | IPFS CID                                                                          |
| COMPRESSION_ALGORITHM           | GZIP                                                                              |
| REVEAL_VALUE                    | SHA256 Multihash (0x12)                                                           |
| GENESIS_TIME                    | Smart Contract\*                                                                  |
| MAX_CORE_INDEX_FILE_SIZE        | 1 MB (zipped)                                                                     |
| MAX_PROVISIONAL_INDEX_FILE_SIZE | 1 MB (zipped)                                                                     |
| MAX_PROOF_FILE_SIZE             | 2.5 MB (zipped)                                                                   |
| MAX_CHUNK_FILE_SIZE             | 10 MB                                                                             |
| MAX_MEMORY_DECOMPRESSION_FACTOR | 3x file size                                                                      |
| MAX_CAS_URI_LENGTH              | 100 bytes                                                                         |
| MAX_DELTA_SIZE                  | 1,000 bytes                                                                       |
| MAX_OPERATION_COUNT             | 10,000 ops                                                                        |
| MAX_OPERATION_HASH_LENGTH       | 100 bytes                                                                         |
| NONCE_SIZE                      | 16 bytes                                                                          |

## CRUD Operations

Element supports the 4 CRUD operations defined in the [Sidetree Protocol API Specification](https://identity.foundation/sidetree/api/).
Each operation is performed by submitting a Sidetree operation in the form of and HTTP POST request to a Sidetree node.
The body of the HTTP POST request for an operation will have the Content-Type of `application/json` to the `[server path]/operations` REST end point.

```json
{
  "type": OPERATION_TYPE,
  ...
}
```

The only required field of the JSON HTTP POST data is the operation type, which can be `create`, `update`, `recover` or `deactivate`.
The other fields are operation specific, and defined in the sections below.

### Create Operation

The `payload` for a create operation MUST be a did document model, that is to say the did document without the `id` property, and without the `controller` property for the publicKeys.

A did document model should look like this

```json
{
  "@context": "https://w3id.org/did/v1",
  "publicKey": [
    {
      "id": "#primary",
      "type": "JsonWebKey2020",
      "publicKeyJwk": {
        "crv": "Ed25519",
        "x": "2UR1Cz7qUSuoc4b4xw4JNJto1PD4IcTNC28Xdwrbdug",
        "kty": "OKP"
      }
    },
    {
      "id": "#secondary",
      "type": "JsonWebKey2020",
      "publicKeyJwk": {
        "crv": "Ed25519",
        "x": "2UR1Cz7qUSuoc4b4xw4JNJto1PD4IcTNC28Xdwrbdug",
        "kty": "OKP"
      }
    }
  ]
}
```

### Recover

In order to resolve a did into a did document, one MUST use the resolve API of an Element node.

See [the Sidetree spec](https://identity.foundation/sidetree/spec) for more details on how a read operation is performed by an Element node

### Update

The `payload` for an update operation MUST be of the following format:

```json
{
  "didUniqueSuffix": "The did unique suffix (the did without the did:elem part)",
  "previousOperationHash": "The operation hash of the latest CREATE or UPDATE operation returned by the Sidetree client",
  "patches": [
    "a list of",
    "supported",
    "patches to apply",
    "to the did document"
  ]
}
```

The list of patches currently supported is:

- `add-public-keys`
- `add-authentication`
- `remove-authentication`
- `add-assertion-method`
- `remove-assertion-method`
- `add-capability-delegation`
- `remove-capability-delegation`
- `add-capability-invocation`
- `remove-capability-invocation`
- `add-key-agreement`
- `remove-key-agreement`
- `add-service-endpoint`
- `remove-service-endpoint`

An update payload SHOULD look like this

```json
{
  "didUniqueSuffix": "EiDV20SIx04vrz-2iea-UE7G6y7eRwo7lnCKJNYTfZ3rcQ",
  "previousOperationHash": "EiAZSwY92kqd5oeaWULYe2EjZc6TxTL9yHWgWOVKJraw9w",
  "patches": [
    {
      "action": "add-public-keys",
      "publicKeys": [
        {
          "id": "#newKey2",
          "usage": "signing",
          "type": "JsonWebKey2020",
          "publicKeyJwk": {
            "crv": "Ed25519",
            "x": "2UR1Cz7qUSuoc4b4xw4JNJto1PD4IcTNC28Xdwrbdug",
            "kty": "OKP"
          }
        },
        {
          "id": "#newKey3",
          "usage": "signing",
          "type": "JsonWebKey2020",
          "publicKeyJwk": {
            "crv": "Ed25519",
            "x": "2UR1Cz7qUSuoc4b4xw4JNJto1PD4IcTNC28Xdwrbdug",
            "kty": "OKP"
          }
        }
      ]
    },
    {
      "action": "remove-public-keys",
      "publicKeys": ["#primary"]
    }
  ]
}
```

### Delete

The `payload` for a DELETE operation MUST be:

```json
{
  "didUniqueSuffix": "The did unique suffix (the did without the did:elem part)"
}
```

## Security and privacy considerations

A Sidetree did document need not contain a `proof` property. Indeed, all operations are authenticated with the `signature` field of the payload sent to the Sidetree node. This signature is generaged using a key specified in the corresponding DID Document.
