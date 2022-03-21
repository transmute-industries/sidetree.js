# @sidetree/dashboard

1. Summary
   - Docker Hub Image
3. Setting up a Node
   - DID Element
   - DID Photon
   - DID Ion
   - DID Orb
4. What You Can Do In The App
   - Create a Wallet
   - Creaye a DID
   - Viewing Node Transactions
   - Viewing Node Operations
   - Resolving a DID

## Summary

This package contains a Next.js app that can be used to operate a sidetree node.
Running this application will start up a sidetree node and provide you a simple UI to interact with the node.

This UI will allow you to:

- Create a wallet that is kept in local storage.
- Create a DID.
- Resolve a DID.
- See the transactions that are happening on your node.
- See the operations that are happening on your node.

The following operations are not available from the UI:

- Delete DID
- Update DID

### Docker Hub Image

Docker hub image: https://hub.docker.com/r/transmute/sidetree-dashboard

## Setting Up a Node

The Sidetree Dashboard is intended to be a general purpose implementation of the Sidetree protocol.
Environment variables are required for setting up a Node with a specific Ledger/CAS combination.

### DID Element

[DID Element Spec](https://github.com/transmute-industries/sidetree.js/tree/main/packages/did-method-element)  
Deployed node of Element Ropsten Testnet: [ropsten.element.transmute.industries](https://ropsten.element.transmute.industries)

DID Element uses the Etherum Ledger and IPFS for Content Addressable Storage. 
DID Element uses Ganache locally for a developer environment, and Ropsten for a test envrionment.
Below are several readme's which describe how to set up an Element Node covering different possible deployment
conditions. 

- [Setup a Development Node with Ganache on a Raspberry Pi](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method-element/docs/local-dev.md)
- [Setup a Testnet Node with Ropsten on a Raspberry Pi](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method-element/docs/local-element-ropsten-install.md)
- [Setup a Testnet Node with Ropsten using Docker](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method-element/docs/docker-element-ropsten-install.md)
- [Setup a Testnet Node with Google Cloud Platform](https://github.com/transmute-industries/sidetree.js/blob/main/packages/dashboard/docs/deploy-to-gcp.md)

### DID Photon

[DID Photon Spec](https://github.com/transmute-industries/sidetree.js/tree/main/packages/did-method-photon)

### DID Ion

[DID Ion Spec](https://github.com/decentralized-identity/ion)  
See https://github.com/transmute-industries/sidetree.js/issues/379

### DID Orb

[DID Orb Spec](https://github.com/trustbloc/orb)  
See https://github.com/transmute-industries/sidetree.js/issues/380

## What You Can Do In The App

![Sidetree.js Dashboard](https://user-images.githubusercontent.com/25621780/159126440-f872454c-fd31-49ac-957e-99eab1c62fd2.png)

When the application first loads, you should be greeted with a welcome screen listing the did method you are using in the node.

The different sections of the application are:

1. Manage - This section lets you create a wallet and/or DIDs for your wallet.
2. Explore - This section will let you see the transactions and operations that are happening on your node.
3. Resolve - This section will let you resolve a DID, allowing you to see information about that did.

#### Create a wallet (Manage)

![Sidetree.js Create Wallet](https://user-images.githubusercontent.com/25621780/159128369-336a4dc3-ed3f-4ae4-a7df-f348340d177e.png)

Before you can create a DID, you will need to create a wallet. This can be done by clicking the "Manage CTA". This should take you to the `http://localhost:3000/wallet` page.

If you do not already have a wallet, you should see a prompt asking you to generate one. To generate a wallet, simply click the button in the prompt.

One your wallet is created, the conents of the wallet are kept in the browsers `localStorage`. This means you will need to access this to obtain any DIDs you create or add to the wallet.

#### Creating a DID (Manage)

![Sidetree.js Create DID](https://user-images.githubusercontent.com/25621780/159128394-ee5f655c-cf08-4e34-a535-0a88e2592140.png)

Now that we have a wallet created, we will be able to create a DID.

To do this we will navigate to the `Create` page listed under `Operations` in the application's sidebar.

This will take you to the `http://localhost:3000/create` page.

To create a new DID, simply click the `Create DID` button on the page.

This will create the new DID and add it your wallet.

#### Viewing Node Transactions (Explore)

Now that we have created a DID using our node, we should be able to see this transaction in our Transactions Explorer.

If you click the `Transactions` menu in the application sidebar, you should be taking to `http://localhost:3000/transactions` where you will see a table and 1 transaction listed.

#### Viewing Node Operations (Explore)

You can also view the latest operations performed by the node by clicking the `Operations` menu item in the application sidebar.

This will take you to `http://localhost:3000/operations` where you will be able to see a table of the operation identifiers, along with additional information regarding that particular operation.

#### Resolving a DID (Resolve)

Lastly, inside the application, you are also able to resolve a DID. You can do this by click the `Resolve` menu item in the application sidebar.

This will take you to `https://localhost:3000/resolve` where you will be presented with an input.

We can use this page to resolve the DID we previously created. Because our wallet is kept in the browsers `localStorage`, we will need to grab our newly created DID from there.

We can then enter that into the form and click `Resolve`.

Once resolved, we will be able to see basic information about the DID broken down into the following sections:

- Verification
- Credentials
- Presentations
- Services
