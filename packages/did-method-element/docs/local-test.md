# Testnet Install

This guide will describe how to install and run Element locally on a Linux machine
running Unbuntu 20.04.3 on either an x86_64 machine, or Raspberry Pi 4. This guide
will use the example name of `ubuntu` (with lower-case `u`) to describe the user
and default home directory of `/home/ubuntu`. 

This document will be similar to the Ganache-dev install with the two differences
in this case are that:

1. We will need to set up and fund a wallet for testnet
2. We will be using a service provider for the Etherium Blockchain

**Note** Later versions of this document will include instructions on how to
set up and run and Ethereum node locally. 

## Table of Contents

- Install Dependencies
- Clone and Build the Repository
- Start Required Services
- Run Create / Resolve Operation

## Install Dependencies

Install IPFS

```
$ sudo snap install ipfs
$ ipfs init
$ sudo vim /lib/systemd/system/ipfs-daemon.service
--- Create File ---
[Unit]
Description=IPFS daemon
Wants=network.target
After=network.target

[Service]
User=ubuntu
Group=ubuntu
Type=simple
Environment=IPFS_PATH=/home/ubuntu/snap/ipfs/common
ExecStart=/snap/bin/ipfs daemon --migrate
ExecStop=/usr/bin/pkill -f ipfs
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
--- EOF ---
$ sudo systemctl start ipfs-daemon.service
$ sudo systemctl enable ipfs-daemon.service
```

Install MongoDB

```
$ wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo systemctl daemon-reload
$ sudo systemctl enable mongod.service
$ sudo systemctl start mongod.service
```

Install Nodejs (v14)

```
$ sudo apt install -y python-is-python3 make gcc
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
$ source ~/.bashrc
$ nvm install 14
$ nvm use 14
```

## Clone and Build the Repository

```
$ cd /home/ubuntu
$ git clone https://github.com/transmute-industries/sidetree.js.git
$ cd sidetree.js
$ npm i
```

## Create and Fund a Wallet

Since we're using the Ropsten Ethereum testnet, we will need to create
a wallet and then fund it from a wallet. We will create a wallet from
a mnomic phrase. The first step will be to goto this [Nmemonic Code Converter](https://iancoleman.io/bip39/) page.

![Screenshot from 2021-12-09 04-00-05](https://user-images.githubusercontent.com/86194145/145269253-6b70dae4-d750-4f63-9049-5874d9ab1363.png)

1. Make sure that `12` words are being generated 
2. Click on the `GENERATE` button
3. You should have twelve words appear in the text area below

Once we have our twelve word phrase, we will use it to import a wallet.
The wallet we will use is called [MetaMask](https://metamask.io/), which is implement with a 
browser extension. You can click on the following [download link](https://metamask.io/download.html) to get the appropriate install instructions for your browser. 

![Screenshot from 2021-12-09 02-12-20](https://user-images.githubusercontent.com/86194145/145253613-92c3d674-8cec-47b0-aa54-b855671febc8.png)

Once the extension is installed, you will be greeted with the above welcome 
screen. Click on the button to `Get Started`. 

![Screenshot from 2021-12-09 02-12-35](https://user-images.githubusercontent.com/86194145/145253923-0f6a77c1-864f-4617-97b5-fc9bbfd779d4.png)

From there, you will be given the option to import an existing wallet, or create a
new one. Since we have already created our mnemonic phrase, we want to click on the
`Import Wallet` button.

![Screenshot from 2021-12-09 02-30-40](https://user-images.githubusercontent.com/86194145/145256030-884daa04-bb59-4e8d-8bba-7b044135615a.png)

From there you will be given the option to gather usage data or not. Select
the option that you prefer. 

![Screenshot from 2021-12-09 02-39-48](https://user-images.githubusercontent.com/86194145/145256731-82446d1a-c1bb-4041-a978-24052d815950.png)

To import your wallet, paste your twelve word mnemonic phrase that you generated
into the `Secret Recovery Phrase` field. You will be required to create a password.
You will need this password to access your wallet from the browser, so make
it secure, but keep in mind that you will need to remember it. Once you are ready
click on the `Import` button. 

![Screenshot from 2021-12-09 02-42-22](https://user-images.githubusercontent.com/86194145/145257109-f16a172d-0185-4bcd-9045-6e5f6e7810db.png)

You should get a message that says "Congratulations". Click on the `All Done`
button, and we will proceed to describe how to fund the wallet.

![Screenshot from 2021-12-09 03-13-08](https://user-images.githubusercontent.com/86194145/145261400-9f307720-aa1e-43a6-844e-3c96716adb95.png)

The page should transition to our wallet. We want to click on the select
field in the top right hand corner that says `Ethereum Mainnet`, and then 
we want to click on the link that says `Show/hide` test networks.

![Screenshot from 2021-12-09 03-14-14](https://user-images.githubusercontent.com/86194145/145261611-24643f76-38d0-427e-a016-a828906fcf33.png)

This will take us to a settings option that we want to toggle to `ON`. 

![Screenshot from 2021-12-09 03-15-01](https://user-images.githubusercontent.com/86194145/145261741-f17bd790-f404-44ab-a753-e9e7d70b3a6c.png)

Once we do that, the top right select input should now show the `Ropsten`
test network. We want to click on that because that is what we will be funding.

![Screenshot from 2021-12-09 03-16-14](https://user-images.githubusercontent.com/86194145/145262097-1116e205-869b-453f-86e4-9b3af2f984d6.png)

To get our address, we can click on the header that says `Account 1` at the top
to copy the address to the clickboard. 

![Screenshot from 2021-12-09 03-19-46](https://user-images.githubusercontent.com/86194145/145262382-c708ab4c-c020-462b-84f9-87ce75ef76b7.png)

From there we want to goto the [Ropsten Etereum Faucet](https://faucet.ropsten.be/),
and paste in our address. And then click on the `Send me test Ether` button. You
should get a confirmation that says, "request added to the queue". Depending on availabity,
you might need to select a different faucet. 

![Screenshot from 2021-12-09 03-34-15](https://user-images.githubusercontent.com/86194145/145266785-7ce85c2b-5d71-429b-90f8-eac334297251.png)

Once you have funds in your wallet, we're ready to move onto the next step
of configuring our node to reference our wallet via the mnemonic string.
With respect to the amount of funds needed to operate a node, Element should
only use the mimimum transaction to send anchor requests to the smart contract.
So topping up your wallet is only something that should be done rarely if ever
with respect to testnet. 

## Ethereum Testnet

As stated in the abstract of this document, this section will include 
instructions for how to setup a Ethereum testnet node locally. 

In the current form of this document, we will connect to an Ethereum
testnet blockchain Ropsten via a cloud service. We specifically recomend
[Infura](https://infura.io). 

To breifly describe the steps of getting setup with Infura.
First you can create a free account. 
Then you can create a project. Once you have created a project, you should
get an API key for the Ehterium Testnet Ropstein. You should have a URL
that looks similar to the following structure. 

```
https://ropsten.infura.io/v3/[YOUR_PROJECT_API_KEY]
```

To use this service, you MUST edit the environment variable in the Sidetree.js
repository before starting the Sidetree-Element service. 

```
$ cd /home/ubuntu/sidetree.js/packages/dashboard
$ cp .env.example .env.local
$ vim .env.local
--- Edit The Following Lines ---
NEXT_PUBLIC_SIDETREE_METHOD="elem:ropsten"
NEXT_PUBLIC_OPERATOR=[YOUR_ORGANIZATION_NAME]
NEXT_PUBLIC_METHOD="Element Ropsten"
NEXT_PUBLIC_DESCRIPTION="Sidetree on Ethereum Ledger and IPFS Cas."

DATABASE_NAME="element-ropsten"

ELEMENT_ANCHOR_CONTRACT="0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997"
ETHEREUM_RCP_URL=https://ropsten.infura.io/v3/[YOUR_PROJECT_API_KEY]
ETHEREUM_MNEMONIC=[YOUR_WALLET_MNEMONIC]
--- End Contents
```

## Start Required Services

IPFS and MongoDB should be running in the background as a daemon service.
The two services that you will need to run are `ganache-cli` and the
`element` dashboard. 

You can run these directly in the terminal, or start them with a screen,
or other method, to have them run in the background, if you choose to
use it. This guide will provide the commands for running in an active
terminal.

**Start Element**
```
$ cd packages/dashboard
$ npm run dev:elem
```

**Note**: If you are not planning on changing anything inside the UI or the
API, you might considder buildind and running the Element Service

```
$ npm run build
$ npm run start
```

## Run Example API

- In the dashboard Create a wallet
- Go to create to create a did
- Go to resolve to resolve a did


