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
- [Docker Testnet Development with Ropsten](docs/docker-element-ropsten-install.md)

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
| GENESIS_TIME                    | Smart Contract*                                                                   |
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

Element uses Ethereum for the ledger layer, which means that did's are anchored to the block chain with a smart contract,
instead of being appended to a `NO_OP` transaction. This means that rather than a specific block, Element will monitor
a specific smart contract address for existing and new anchor transactions. 

The Elment Contract Address for Ropsten is: `0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997`.

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
The other fields are operation specific, and defined in the sections below. Example code for generating each one of these operations
for Element can be found in the [wallet test](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method/src/__tests__/wallet.sanity.test.ts).

### Create Operation

Example Create

```json
{
  "type":"create",
  "suffixData":{
    "deltaHash":"EiCP8MJ9oX2jmTxVi6xa1WoGmzkg8HaxmWWiR6R34cUmvw",
    "recoveryCommitment":"EiCFei9R_74JeKbxGIZPI4XXwbb0eDpBeweA9IpymBEOFA"
  },
  "delta":{
    "updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg",
    "patches":[
      {
        "action":"replace",
        "document":{
          "publicKeys":[
            {
              "id":"signingKey",
              "type":"EcdsaSecp256k1VerificationKey2019",
              "publicKeyJwk":{
                "kty":"EC",
                "crv":"secp256k1",
                "x":"8a7JVJUDcR_mS6gyTAgdvGFZkhO8plwWfId3xqHa7xA",
                "y":"xIxXstl9XR-hXXBkrhzxrFhJRvab2MLhQDus92S8G2o"
              },
              "purposes":[
                "authentication",
                "assertionMethod",
                "capabilityInvocation",
                "capabilityDelegation",
                "keyAgreement"
              ]
            }
          ],
          "services":[
            {
              "id":"serviceId123",
              "type":"someType",
              "serviceEndpoint":"https://www.url.com"
            }
          ]
        }
      }
    ]
  }
}
```

### Recover

Example Recover

```json
{
  "type":"recover",
  "didSuffix":"EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg",
  "revealValue":"EiBDFxzWmxgVG9SH-PY-9Yz73-6mnI8egnypTx1fjlKMKw",
  "signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkZWx0YUhhc2giOiJFaURaeXJBQk13dGZ1YmNGSXlZelhkb09wNXdObzZCNW82MGxvaUg1Qkh3VldRIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiODZzeDZ5dVdZWjVMRFp1WFd4WF9FdEtrbFN1a21jSDdQZUIzNFNrWUVjZyIsInkiOiJzVlR6VGhVejNDRk82N2doWHVIQXV6Q2ZCVWdKa0V3WkZrbzZQM0ZzNnIwIn0sInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpREFUNGxlYm14S3FTOXFyT1ROZ0lOakJ1aHY1VUJWS1h3Y0NQQ0hiellNX1EifQ.w9jDo4hrTVxbA3oA7QH6YOiTSM5y1f697Dj7m4DPg3ShbhjK3KwXmrHEu5lpFXcxAFB47hW0G1rzm7PpNm9bwQ",
  "delta":{
    "patches":[
      {
        "action":"replace",
        "document":{
            "publicKeys":[
            {
              "id":"signingKey",
              "type":"EcdsaSecp256k1VerificationKey2019",
              "publicKeyJwk":{
                "kty":"EC",
                "crv":"secp256k1",
                "x":"naoGdqBTAvOAVaXjRJb_MW2BPw86iGWLs4i9ylN0dbE",
                "y":"dOfZc0yVkTm70h_ixQOu-B_T29dzxGTILf1-xoqYeao"
              },
              "purposes":[
                "authentication",
                "assertionMethod",
                "capabilityInvocation",
                "capabilityDelegation",
                "keyAgreement"
              ]
            }
          ]
        }
      }
    ],
    "updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"
  }
}
```

### Update

Example Update 

```json
{
  "type":"update",
  "didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A",
  "revealValue":"EiD0FtXueh5RDV_DlLcOuxjPnT-pheGPfhvaYUivLpGmZA",
  "delta":{
    "patches":[
      {
        "action":"add-services",
        "services":[
          {
            "id":"someId",
            "type":"someType",
            "serviceEndpoint":"someEndpoint"
          }
        ]
      }
    ],
    "updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"
  },
  "signedData":"eyJhbGciOiJFUzI1NksifQ.eyJ1cGRhdGVLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiMTdOVnAwX3pwLUJON3FkeTJhbkNqcDk1TS1sVF9pZ2xpTENEZ1hvS2F6YyIsInkiOiJ4TzJPQlZSOGxFTW94N1hvYzVYU1dYSC1yUm5jbHk5b2NvTVBUVkhVZmtzIn0sImRlbHRhSGFzaCI6IkVpQ2VkUlZYWGRaU0VMSmRqNzhJclVwaFVJYkVSWFA1UWlrSTN1ZEVvSmFRcEEifQ.-oeeFd4XrAf1L9pt0V_MjXIEubqAEHKPGA1s3JnrdWLHcG3uXF2wZSI_xoDMTlRuwHkJjt-tt918Ce9OXwi4PQ"
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


### Deactivate

Example Deactivate.

```json
{
  "type":"deactivate",
  "didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A",
  "revealValue":"EiCk-d_6aijSJVJ9K00qlfprLUew_TUZqZ4b8dtl_5mpww",
  "signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkaWRTdWZmaXgiOiJFaUJ1dWljV1Z4T2NiaENXME45WVNSSndCN2F1cWJ6aE1oS2cxcVhSVFIzMF9BIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiLUhWWFJRNVNGTnRoWFk2Mkxya3N2Z2dqdkVlaEF1Sll3bTVkS0ZZSzJ5ZyIsInkiOiJqQVVqYmo5N3I2dDNTY0pvVW1DTjRwejRpdXVpdGVrMEtKSlFaMndHU1g4In19.L9fl_GHr5jseHUckE0dx4ib-YkFiFBx5YgdFJ8_pcNa71JPTbGT2T4_WY7HUsQqBe_F-yzoDd_FozspFC2PqKw"
}
```

## Resolve Operation

To resolve a DID , send a GET request to the `[server path]/identity/{did}` REST end point.
For example, to resolve the DID `did:elem:ropsten:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A` we send a GET request to
`https://ropsten.element.transmute.industries/api/1.0/identifiers/did:elem:ropsten:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A`.

And we should get the following response. 
```
{
  "@context": "https://w3id.org/did-resolution/v1",
  "didDocument": {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/jws-2020/v1",
      {
        "@vocab": "https://www.w3.org/ns/did#"
      }
    ],
    "id": "did:elem:ropsten:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A",
    "verificationMethod": [
      {
        "id": "#zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp",
        "controller": "did:elem:ropsten:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A",
        "type": "JsonWebKey2020",
        "publicKeyJwk": {
          "kty": "EC",
          "crv": "secp256k1",
          "x": "7hfx9LZXlMBaZ2EurUcXOITSIGLIFQ4YY7pXCbEqntU",
          "y": "B1FId5MlHAuhxsDU9uvPuE2JXKVPP3ohjuR6HUvY6XM"
        }
      }
    ],
    "authentication": [
      "#zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp"
    ],
    "assertionMethod": [
      "#zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp"
    ],
    "keyAgreement": [
      "#zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp"
    ]
  },
  "didDocumentMetadata": {
    "method": {
      "published": true,
      "recoveryCommitment": "EiB2lrE88cmhcepLS-p8wBbxHfZKSvniCKfL0CfZe4i36g",
      "updateCommitment": "EiBch3E26X_PoJ_Io2NS8-Dn6F94hcMAChZ6-AaZ2B_pUQ"
    },
    "canonicalId": "did:elem:ropsten:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A"
  }
}
```

## Security and privacy considerations

A Sidetree did document need not contain a `proof` property. Indeed, all operations are authenticated with the `signature` field of the payload sent to the Sidetree node. This signature is generaged using a key specified in the corresponding DID Document.
