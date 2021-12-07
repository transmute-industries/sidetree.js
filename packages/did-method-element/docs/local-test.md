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

- create a new mnemonic phrase
- import nmemonic into metamask wallet
- fund metamask wallet with ropsten faucet

You should get around 0.3ETH from the faucet. This will be more
than enough to use testnet for an extremely long amount of time
as each write transaction to element should only use something like
0.0001 (estimate) ETH per anchor transaction. 

Adding funds to the wallet is only something you should do if your
funds are running extemely low, if ever. 

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
NEXT_PUBLIC_ELEMENT_METHOD='elem:ropsten'
ETHEREUM_RCP_URL=https://ropsten.infura.io/v3/[YOUR_PROJECT_API_KEY]
MNEMONIC=[Change to your own wallet mnemonic]
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


