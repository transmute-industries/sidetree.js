# @sidetree/photon

![Transmute Photon Logo](./photon-logo.png)

1. About Photon
   - Performance
   - DID Photon FIPS Compliance
   - QLDB
3. Package Information
   - Development
   - Photon Package
5. Photon DID Method Spec
   - Abstract
   - Method Syntax
   - CRUD Operations
   - Resolve Operation

## About Photon

Photon is meant for production application, that require speed, scalability, reliability and security.

As opposed to most public permissionless ledgers, AWS QLDB is centralized and fully managed. At the cost of having Amazon as a root of trust, hence not being decentralized, QLDB gets significant speed, reliability and scalability benefits, while retaining all the cryptographic properties like immutability that an append only ledger provides.

These properties of AWS QLDB combined with the use of [FIPS 140-2](https://en.wikipedia.org/wiki/FIPS_140-2) compliant cryptography make Photon more suitable for government use cases than DID method based on public ledgers like Bitcoin and Ethereum which are powered by the not (yet) NIST approved secp256k1 elliptic curve.

### Performance

See [Issue #118: Add scalability notes to ledger-qldb](https://github.com/transmute-industries/sidetree.js/issues/118)  
TODO: Benchmark comparing the capacity (measured in anchored DIDs per second) of several Sidetree based DID methods:

- Element
- Ion
- Photon

### DID Photon FIPS Compliance

Regarding FIPS Compliance, we have the following recommendations:

Use [AWS KMS](https://aws.amazon.com/kms/) for keys:

"AWS KMS is a secure and resilient service that uses hardware security modules that have been validated under FIPS 140-2, or are in the process of being validated, to protect your keys."

Use an official FIPS compliant signature algorithm like ES256 ES384.

EdDSA with Ed25519 is [still in draft phase](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5-draft.pdf).

Possible to run core compomnents in [GovCloud](https://aws.amazon.com/govcloud-us):

- IPFS node in EC2
- DynamoDB cache
- KMS


### QLDB

- Contrary to public ledgers, write access to QLDB requires [IAM credentials](https://aws.amazon.com/iam/), hence only authorized actors can create and update DIDs
- The [security of the QLDB ledger](https://docs.aws.amazon.com/qldb/latest/developerguide/security.html) relies on the [shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) which means
  - AWS is responsible for operating, managing and controlling the components from the host operating system and virtualization layer down to the physical security of the facilities in which the service operates.
  - We are responsible for security of keys associated with the IAM credentials
- QLDB uses a Merkle Tree with the SHA256 hash function to build its immutable ledger capabilities, which is part of FIPS's Secure Hash Standard. See https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
- "[Data in transit is encrypted using TLS](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)"

## Package Information

```
npm install --save @sidetree/photon
```

### Development

```
npm install
npm run test
```

### Photon Package

(from the root level) To install photon specificly

```bash
npm run install:only @sidetree/photon
```

To test photon specificly run

```bash
npm run test:only @sidetree/photon
```

## Photon DID Method Spec

### Abstract

Photon is an implementation of [version v1.0.0 of the Sidetree protocol](https://identity.foundation/sidetree/spec/). It uses

- [Amazon QLDB](https://aws.amazon.com/qldb/) for the ledger layer, a fully managed ledger database that provides a transparent, immutable, and cryptographically verifiable transaction log ‎owned by a central trusted authority. Amazon QLDB can be used to track each and every application data change and maintains a complete and verifiable history of changes over time.
- [Amazon S3](https://aws.amazon.com/s3/) for the Content-addressable storage layer

### Method syntax

The namestring identifying this did method is `photon`

A DID that uses this method MUST begin with the following prefix: `did:photon`. Per the DID specification, this string MUST be in lowercase.

The remainder of a DID after the prefix, called the did unique suffix, MUST be `SHA256` hash of the encoded create payload. See the [DID Uri Spec](https://identity.foundation/sidetree/spec/#did-uri-composition) for more information.

An example of a valid photon did is: `did:photon:EiDjQYg7Q2pwgj4BQCEnq7yZrY9YEWbg6toqbQQPPW6jaA`

### CRUD Operations

Photon supports the 4 CRUD operations defined in the [Sidetree Protocol API Specification](https://identity.foundation/sidetree/api/).
Each operation is performed by submitting a Sidetree operation in the form of and HTTP POST request to a Sidetree node.
The body of the HTTP POST request for an operation will have the Content-Type of `application/json` to the `[server path]/operations` REST end point.

```
{
  "type": OPERATION_TYPE,
  ...
}
```

The only required field of the JSON HTTP POST data is the operation type, which can be `create`, `update`, `recover` or `deactivate`.
The other fields are operation specific, and defined in the sections below. Example code for generating each one of these operations
for Photon can be found in the [wallet test](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method/src/__tests__/wallet.sanity.test.ts).

#### Create Operation

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

#### Recover

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

#### Update

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


#### Deactivate

Example Deactivate.

```json
{
  "type":"deactivate",
  "didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A",
  "revealValue":"EiCk-d_6aijSJVJ9K00qlfprLUew_TUZqZ4b8dtl_5mpww",
  "signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkaWRTdWZmaXgiOiJFaUJ1dWljV1Z4T2NiaENXME45WVNSSndCN2F1cWJ6aE1oS2cxcVhSVFIzMF9BIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiLUhWWFJRNVNGTnRoWFk2Mkxya3N2Z2dqdkVlaEF1Sll3bTVkS0ZZSzJ5ZyIsInkiOiJqQVVqYmo5N3I2dDNTY0pvVW1DTjRwejRpdXVpdGVrMEtKSlFaMndHU1g4In19.L9fl_GHr5jseHUckE0dx4ib-YkFiFBx5YgdFJ8_pcNa71JPTbGT2T4_WY7HUsQqBe_F-yzoDd_FozspFC2PqKw"
}
```

### Resolve Operation

To resolve a DID , send a GET request to the `[server path]/identity/{did}` REST end point.
For example, to resolve the DID `did:photon:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A`, we should get the following response. 

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
    "id": "did:photon:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A",
    "verificationMethod": [
      {
        "id": "#zQ3shvfXLUVwKffPochZ1UkSjxQqpgND3Z5DhzTADooqmmypp",
        "controller": "did:photon:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A",
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
    "canonicalId": "did:photon:EiCtwD11AV9e1oISQRHnMJsBC3OBdYDmx8xeKeASrKaw6A"
  }
}
```


