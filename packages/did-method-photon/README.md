# @sidetree/photon

This package contains an implementation of Sidetree Core, using AWS QLDB and IPFS

## Usage

```
npm install --save @sidetree/photon
```

## Development

```
npm install
npm run test
```

# Photon DID Method Spec

<p align="center">
  <img width="300" height="300" src="./photon-logo.png">
</p>

## Abstract

Photon is an implementation of [version v0.1.0 of the Sidetree protocol](https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/). It uses
- [Amazon QLDB](https://aws.amazon.com/qldb/) for the ledger layer, a fully managed ledger database that provides a transparent, immutable, and cryptographically verifiable transaction log ‎owned by a central trusted authority. Amazon QLDB can be used to track each and every application data change and maintains a complete and verifiable history of changes over time.
- [IPFS](https://ipfs.io/) for the Content-addressable storage layer

For more information about Sidetree, see:
- https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/
- github.com/transmute-industries/sidetree.js
- https://github.com/decentralized-identity/sidetree

## Introduction

Photon is meant for production application, that require speed, scalability, reliability and security.

As opposed to most public permissionless ledgers, AWS QLDB is centralized and fully managed. At the cost of having Amazon as a root of trust, hence not being decentralized, QLDB gets significant speed, reliability and scalability benefits, while retaining all the cryptographic properties like immutability that an append only ledger provides.

These properties of AWS QLDB combined with the use of [FIPS 140-2](https://en.wikipedia.org/wiki/FIPS_140-2) compliant cryptography make Photon more suitable for government use cases than DID method based on public ledgers like Bitcoin and Ethereum which are powered by the not (yet) NIST approved secp256k1 elliptic curve.

## Performance

TODO: Benchmark comparing the capacity (measured in anchored DIDs per second) of several Sidetree based DID methods:
- Element
- Ion
- Photon

## Method syntax

The namestring identifying this did method is `photon`

A DID that uses this method MUST begin with the following prefix: `did:photon`. Per the DID specification, this string MUST be in lowercase.

The remainder of a DID after the prefix, called the did unique suffix, MUST be `SHA256` hash of the encoded create payload. See https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#did-uri-composition for more information.

An example of a valid photon did is: `did:photon:EiDjQYg7Q2pwgj4BQCEnq7yZrY9YEWbg6toqbQQPPW6jaA`

## CRUD Operations

Photon supports the CRUD operations;

### Create

https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#create

### Read / Resolve

https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#resolution

### Update

https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#update

For update operations, Photon only supports `ietf-json-patch`, see https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#did-state-patches

### Recover

https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#recover

### Deactivate

https://web.archive.org/web/20200721150053/https://identity.foundation/sidetree/spec/v0.1.0/#deactivate

## Security and privacy considerations

### QLDB

- Contrary to public ledgers, write access to QLDB requires [IAM credentials](https://aws.amazon.com/iam/), hence only authorized actors can create and update DIDs
- The [security of the QLDB ledger](https://docs.aws.amazon.com/qldb/latest/developerguide/security.html) relies on the [shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) which means
  - AWS is responsible for operating, managing and controlling the components from the host operating system and virtualization layer down to the physical security of the facilities in which the service operates.
  - We are responsible for security of keys associated with the IAM credentials
- QLDB uses a Merkle Tree with the SHA256 hash function to build its immutable ledger capabilities, which is part of FIPS's Secure Hash Standard. See https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
- "[Data in transit is encrypted using TLS](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)"

### IPFS

- With Sidetree, data integrity is guaranteed with the use of [Content-addressable storage](https://docs.ipfs.io/concepts/content-addressing/#identifier-formats). IPFS is a popular CAS solution to store immutable objects. An immutable object is an object whose state cannot be altered or modified once created. Once a file is added to the IPFS network, the content of that file cannot be changed without altering the content identifier (CID) of the file.

### What can we do to make a stronger case for DID Photon FIPS 140-2 compliance

- Use AWS KMS for keys -> https://aws.amazon.com/kms/ "AWS KMS is a secure and resilient service that uses hardware security modules that have been validated under FIPS 140-2, or are in the process of being validated, to protect your keys."
- Use an official FIPS compliant signature algorithm like P-256. ed25119 is [still is draft phase](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5-draft.pdf), however Anil said it was fine.
-  Use GovCloud: https://aws.amazon.com/govcloud-us
    - We can run an IPFS node in EC2 govcloud
    - We can run a DynamoDB cache running in govcloud
    - We can run KMS in Govcloud