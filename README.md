# Sidetree.js 

[![npm version](https://badge.fury.io/js/%40sidetree%2Fcore.svg)](https://badge.fury.io/js/%40sidetree%2Fcore) ![Continuous Integration](https://github.com/transmute-industries/sidetree.js/workflows/CI/badge.svg)

### What is Sidetree.js

Sidetree.js is a simple-as-possible TypeScript implementation of the Sidetree version
1.0 protocol. The purpose of the Sidetree protocol is to create a blockchain based
public key infrastructure, where rather than having a central authority that can
accept or revoke keys, by having the blockchain act as a whitness for regestering
public keys, anyone can publish a public key that can be used to establish identity.

### How Does Sidetree.js Work?

The Sidetree protocol describes using a Content Addressable Storage and a Ledger
to establish a public key infrastructure. What this boils down to is that public keys
are stored in a Content Addressable Storage, and pointers to that storage are published
on a Ledger.

The simpliest possible example of this would be an public FTP server, where anyone could
upload a public key and a identifier for that public key. In practice, this sets up a
central authority and a single point of failure. In practice we use a public ledger
such as Bitcoin or Ehtereum. And we use IPFS as a Content Addressable Storage to
create Decentralized Identitifiers for Public Keys.

However since the interfaces for what needs to be implemented is flexible, we can also
implement DID methods such as Photon which uses Amazon QLDB for a ledger, and Amazon S3
for content addressable storage.

### Sidetree Based DID Methods

The following did methods are supported or intended to be supported (or planned to be supported) by the the Sidetree.js implementation. More information on how to set up a node can be in the [Dashboard](packages/dashboard/) package. 

| Method        | Spec                                                                                                    | Ledger             | Storage   | Support |
|---------------|---------------------------------------------------------------------------------------------------------|--------------------|-----------|---------|
| did:elem      | [spec](packages/did-method-element/README.md)                                                           | Ethereum           | IPFS      | Full    |
| did:photon    | [spec](packages/did-method-photon/README.md)                                                            | Amazon QLDB        | Amazon S3 | Full    |
| did:ion       | [spec](https://github.com/decentralized-identity/ion)                                                   | Bitcoin            | IPFS      | [Planned](https://github.com/transmute-industries/sidetree.js/issues/379) |
| did:orb | [spec](https://trustbloc.github.io/did-method-orb/) | Hyperledger Fabric | IPFS      | [Planned](https://github.com/transmute-industries/sidetree.js/issues/380) |

### Public Sidetree.js Nodes

**Element**

- https://ropsten.element.transmute.industries/
- https://element.shellshop.lol/

## Developers Guide

See [Development](./DEVELOPMENT.md)

## Commercial Support

Commercial support for these libraries is available upon request from
Transmute: [support at transmute dot industries](mailto:support@transmute.industries)

## Security Policy

Please see our [security policy](./SECURITY.md) for additional details about responsible disclosure of security related issues.

## License

[Apache-2.0](./LICENSE) © Transmute Industries Inc.
