# @sidetree/dashboard

This package contains a Next.js app that can be used to operate a sidetree node.

Running this application will start up a sidetree node and provide you a simple UI to interact with the node.

This UI will allow you to:

- Create a wallet that is kept in local storage.
- Create a DID.
- Resolve a DID.
- See the transactions that are happening on your node.
- See the operations that are happening on your node.

As it stands now, the following operations are not available:

- Delete DID
- Update DID

## Running Your Sidetree Node

## Cloning the Repo & Setting Up The Project

First you will need to begin by cloning the Sidetree.js repo if you have not done so already. Next you will need to navigate to the dashboard directorty.

You can do this with the following command:

```
git clone git@github.com:transmute-industries/sidetree.js.git
cd sidetree.js
npm install
```

Important: The `lerna bootstrap` command will build all of the packages and link them so everything works properly.

## Running Your Sidetree Node

Before you run your sidetree node, we need to make sure we have all of our environment variables properly configured for the type of node we will be running.

There are currently 3 DID method configurations you can use to run your node. They are:

1. example:sidetree.testnet
2. elem:ganache
3. elem:ropsten

Inside this package is an example env file for each configuration along with instructions on how to set up that type of node below.

### Running an `example:sidetree.testnet` node

This is a mock ledger. This means this configuration should work locally even if you are not connected to the internet.

If you are going to use this configuration, you will need to use all of the environment variables found in the `.env.testnet.example` file.

So before doing anything you will need to copy the contents of `.env.example:sidetree.testnet.example` to a new `.env.example:sidetree.testnet` file at the root of the `packages/dashboard` directory.

Once you have you env file set up you can start the node 2 ways:

1. Using Docker: `npm run dev:docker`. This will set up the node inside a docker container. This will server the dashboard at `http://localhost:8080`.
2. `npm run dev`. This will server the dashboard at `http://localhost:3000`.

### Running an `elem:ganache` node

This is a single node that simulates a real blockchain. This means this configuration should work locally even if you are not connected to the internet.

If you are going to use this configuration, you will need to use all of the environment variables found in the `.env.ganache.example` file.

So before doing anything you will need to copy the contents of `.env.ganache.example` to a new `.env.ganache` file at the root of the `packages/dashboard` directory.

Once you have your env file set up, you will need do download Ganache if you have not already. You can download this here: https://trufflesuite.com/ganache/.

After you have the program installed, you will need to open up the application and modify the server settings to use the port specified inside your `.env.ganache` file.

Once you have you env file and Ganache set up you can start the node 2 ways:

1. Using Docker: `npm run dev:ganache:docker`. This will set up the node inside a docker container. This will server the dashboard at `http://localhost:8080`.
2. `npm run dev:ganache`. This will server the dashboard at `http://localhost:3000`.

### Running an `elem:ropsten` node

This is a testnet.

If you are going to use this configuration, you will need to use all of the environment variables found in the `.env.ropsten.example` file.

So before doing anything you will need to copy the contents of `.env.ropsten.example` to a new `.env.ropsten` file at the root of the `packages/dashboard` directory.

WARNING: You need to make sure your ENV file is never committed to source control. Specifically because it uses your mnemonic phrase.

Once you have you env file set up you can start the node 2 ways:

1. Using Docker: `npm run dev:ropsten:docker`. This will set up the node inside a docker container. This will server the dashboard at `http://localhost:8080`.
2. `npm run dev:ropsten`. This will server the dashboard at `http://localhost:3000`.

### What You Can Do In The App

When the application first loads, you should be greeted with a welcome screen listing the did method you are using in the node.

The different sections of the application are:

1. Manage - This section lets you create a wallet and/or DIDs for your wallet.
2. Explore - This section will let you see the transactions and operations that are happening on your node.
3. Resolve - This section will let you resolve a DID, allowing you to see information about that did.

#### Create a wallet (Manage)

Before you can create a DID, you will need to create a wallet. This can be done by clicking the "Manage CTA". This should take you to the `http://localhost:3000/wallet` page.

If you do not already have a wallet, you should see a prompt asking you to generate one. To generate a wallet, simply click the button in the prompt.

One your wallet is created, the conents of the wallet are kept in the browsers `localStorage`. This means you will need to access this to obtain any DIDs you create or add to the wallet.

#### Creating a DID (Manage)

Now that we have a wallet created, we will be able to create a DID.

To do this we will navigate to the `Create` page listed under `Operations` in the application's sidebar.

This will take you to the `http://localhost:3000/create` page.

To create a new DID, simply click the `Create DID` button on the page.

This will create the new DID and add it your wallet.

#### Viewing Node Transactions (Explore)

Now that we have created a DID using our node, we should be able to see this transaction in our Transactions Explorer.

If you click the `Transactions` menu in the application sidebar, you should be taking to `http://localhost:3000/transactions` where you will see a table and 1 transaction listed.

#### Viwing Node Operations (Explore)

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
