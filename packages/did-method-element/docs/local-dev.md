# Development Install

This guide will describe how to install and run Element locally on a Linux machine
running Unbuntu 20.04.3 on either an x86_64 machine, or Raspberry Pi 4. This guide
will use the example name of `ubuntu` (with lower-case `u`) to describe the user
and default home directory of `/home/ubuntu`. 

## Table of Contents

- Install Dependencies
- Clone and Build the Repository
- Start Required Services
- Run Example API

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
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
$ source ~/.bashrc
$ nvm install 14
$ nvm use 14
```


Install Ganache Cli

```
$ npm install ganache-cli -g
```

## Clone and Build the Repository

```
$ git clone https://github.com/transmute-industries/sidetree.js.git
$ cd sidetree.js
$ npm i
```

## Start Required Services

IPFS and MongoDB should be running in the background as a daemon service.
The two services that you will need to run are `ganache-cli` and the
`element` dashboard. 

You can run these directly in the terminal, or start them with a screen,
or other method, to have them run in the background, if you choose to
use it. This guide will provide the commands for running in an active
terminal.

**Start Ganache**
```
$ ganache-cli
```

""Start Element**
```
$ cd packages/dashboard
$ npm run dev:elem
```

## Run Example API

Once Element is running you can access the UI via http://localhost:3000.
You can create a wallet, create a did, and resolve a did from the dashboard.

To test your installation with example did, we can run the following curl
commands.

**Create Request**

```
curl --header "Content-Type: application/json" --request POST --data '{"type":"create","suffixData":{"deltaHash":"EiCP8MJ9oX2jmTxVi6xa1WoGmzkg8HaxmWWiR6R34cUmvw","recoveryCommitment":"EiCFei9R_74JeKbxGIZPI4XXwbb0eDpBeweA9IpymBEOFA"},"delta":{"updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signingKey","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"8a7JVJUDcR_mS6gyTAgdvGFZkhO8plwWfId3xqHa7xA","y":"xIxXstl9XR-hXXBkrhzxrFhJRvab2MLhQDus92S8G2o"},"purposes":["authentication","assertionMethod","capabilityInvocation","capabilityDelegation","keyAgreement"]}],"services":[{"id":"serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}]}}]}}' http://localhost:3000/api/1.0/operations
```

**Create Response**

```
```

**Resolve Request**

```
$ curl http://localhost:3000/api/1.0/identifiers/did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg
```

**Resolve Response**
```
```
