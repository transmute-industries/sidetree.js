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

### Environment Variables

Before you run your sidetree node, we need to make sure we have all of our environment variables properly configured for the type of node we will be running.

The `.env.example` environment file provided in the package contains all of the process environment variables that are required in order to run your node. All of the default values should work straight out of the box.

So before doing anything you will need to copy the contents of `.env.example` to a new `.env` file at the root of the `packages/dashboard` directory.

### Installing & Starting Your Node

Now that we have confirmed we have all of the environment variables we need, we can install our dependencies with the following command (If you ran this after cloning the repo, you shouldn't need to run it again):

```
cd packages/dashboard
lerna bootstrap
```

This will build all of our dependencies used by the application.

Once built, we have 2 options for running our node.

We can run it using docker with the following command:

```
npm run dev:docker
```

Or we can run a stand alone instance without docker with the following command:

```
dev
```

Once started, you should be able to see the application at `http://localhost:3000`.

### What You Can Do In The App

When the application first loads, you should be greeted with a welcome screen listing the did method you are using in the node. If you are using the defauly `.env.local` file, you should see `example:sidetree.testnet`.

Below this is a list of features. They are:

1. Manage - This section lets you create a wallet and/or DIDs for your wallet.
2. Explore - This section will let you see the transactions and operations that are happening on your node.
3. Resolve - This section will let you resolve a DID, allowing you to see information about that did.

#### Create a wallet

Before you can create a DID, you will need to create a wallet. This can be done by clicking the "Manage CTA". This should take you to the `http://localhost:3000/wallet` page.

If you do not already have a wallet, you should see a prompt asking you to generate one. To generate a wallet, simply click the button in the prompt.

One your wallet is created, the conents of the wallet are kept in the browsers `localStorage`. This means you will need to access this to obtain any DIDs you create or add to the wallet.

#### Creating a DID

Now that we have a wallet created, we will be able to create a DID.

To do this we will navigate to the `Create` page listed under `Operations` in the application's sidebar.

This will take you to the `http://localhost:3000/create` page.

To create a new DID, simply click the `Create DID` button on the page.

This will create the new DID and add it your wallet.

#### Viewing Node Transactions

Now that we have created a DID using our node, we should be able to see this transaction in our Transactions Explorer.

If you click the `Transactions` menu in the application sidebar, you should be taking to `http://localhost:3000/transactions` where you will see a table and 1 transaction listed.

#### Viwing Node Operations

You can also view the latest operations performed by the node by clicking the `Operations` menu item in the application sidebar.

This will take you to `http://localhost:3000/operations` where you will be able to see a table of the operation identifiers, along with additional information regarding that particular operation.

#### Resolving a DID

Lastly, inside the application, you are also able to resolve a DID. You can do this by click the `Resolve` menu item in the application sidebar.

This will take you to `https://localhost:3000/resolve` where you will be presented with an input.

We can use this page to resolve the DID we previously created. Because our wallet is kept in the browsers `localStorage`, we will need to grab our newly created DID from there.

We can then enter that into the form and click `Resolve`.

Once resolved, we will be able to see basic information about the DID broken down into the following sections:

- Verification
- Credentials
- Presentations
- Services

### Instructions for deploying on GCP

WIP

See https://github.com/vercel/next.js/blob/canary/examples/with-docker/README.md
