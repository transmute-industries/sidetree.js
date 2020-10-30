# Photon DID Method Spec

<p align="center">
  <img width="200" height="200" src="./photon-logo.png">
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

A Sidetree did document need not contain a `proof` property. Indeed, all operations are authenticated with the `signature` field of the payload sent to the Sidetree node. This signature is generaged using a key specified in the corresponding DID Document.
