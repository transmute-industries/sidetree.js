# Ion Testnet on Raspberry Pi 4

This readme will describe how to install and run a development node of Ion interacting with the Bitcoin Testnet running on the Raspberry Pi 4. 

## Status

This repository `sidetree.js` does not currently support the `did:ion` format.
More information can be found at the `decentralized-identity` [Ion repository](https://github.com/decentralized-identity/ion). 

## Requirements

- Raspberry Pi 4
- 256GB storage medium
- Ubuntu 20.04.3 64bit ARM 

## Table of Contents

1. Install Ipfs
2. Install MongoDB
3. Install Bitcoind
4. Install Nodejs (via nvm)
5. Wait for Bitcoin data to sync, and clone Ion
6. Configure and run Ion "bitcoin" process
7. Configure and run Ion "core" process

Ion has three main dependencies. These are a local ipfs node, bitcoin node, and MongoDB for interacting with. Ion itself is written in Typescript, so we will need Nodejs and NPM to compile and run it. And Ion itself is split into two processes. 

The first is a "bitcoin" process, that will interact with the bitcoind daemon via rpc, and then parse the raw data blocks storing what it needs in MongoDB. The second process is the "core" process that will read the parsed data from the "bitcoin" process and then actually resolve the content from Ipfs from the anchor string. The "bitcoin" ion process runs on port 3002, and the "core" ion process runs on port 3000. 

Before starting, run apt-get update. 

```
$ sudo apt-get update
$ sudo apt-get upgrade
```

### 1. Install Ipfs

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

To check to see if it worked.

```
$ ipfs cat /ipfs/QmQPeNsJPyVWPFDVHb77w8G42Fvo15z4bG2X8D2GhfbSXc/readme
```

You should see

```
Hello and Welcome to IPFS!

██╗██████╗ ███████╗███████╗
██║██╔══██╗██╔════╝██╔════╝
██║██████╔╝█████╗  ███████╗
██║██╔═══╝ ██╔══╝  ╚════██║
██║██║     ██║     ███████║
╚═╝╚═╝     ╚═╝     ╚══════╝

If you're seeing this, you have successfully installed
IPFS and are now interfacing with the ipfs merkledag!

 -------------------------------------------------------
| Warning:                                              |
|   This is alpha software. Use at your own discretion! |
|   Much is missing or lacking polish. There are bugs.  |
|   Not yet secure. Read the security notes for more.   |
 -------------------------------------------------------

Check out some of the other files in this directory:

  ./about
  ./help
  ./quick-start     <-- usage examples
  ./readme          <-- this file
  ./security-notes
```

### 2. Install MongoDB

```
$ wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo systemctl daemon-reload
$ sudo systemctl enable mongod.service
$ sudo systemctl start mongod.service
```

Check to see if it's running

```
$ sudo systemctl status mongod.service
```

You should see

```
● mongod.service - MongoDB Database Server
     Loaded: loaded (/lib/systemd/system/mongod.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2021-10-19 16:11:17 UTC; 1s ago
       Docs: https://docs.mongodb.org/manual
   Main PID: 2788 (mongod)
     CGroup: /system.slice/mongod.service
             └─2788 /usr/bin/mongod --config /etc/mongod.conf

Oct 19 16:11:17 docker-ion-pi4 systemd[1]: Started MongoDB Database Server.
```


### 3. Install Bitcoind

```
$ wget https://bitcoin.org/bin/bitcoin-core-0.21.1/bitcoin-0.21.1-aarch64-linux-gnu.tar.gz
$ tar -xzvf bitcoin-0.21.1-aarch64-linux-gnu.tar.gz
$ sudo cp bitcoin-0.21.1/bin/* /usr/local/bin/
$ mkdir .bitcoin
$ vim .bitcoin/bitcoin.conf
--- Create File ---
testnet=1
server=1
rpcuser=admin
rpcpassword=keyboardcat
txindex=1
--- EOF ---
$ sudo vim /lib/systemd/system/bitcoind.service
--- Create File ---
[Unit]
Description=Bitcoin service
After=network.target

[Service]
User=ubuntu
Group=ubuntu
Type=forking
ExecStart=/usr/local/bin/bitcoind --daemon
ExecStop=/usr/local/bin/bitcoin-cli stop
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-abnormal
TimeoutStopSec=120
KillMode=none
PrivateTmp=true

[Install]
WantedBy=multi-user.target
--- EOF ---
$ sudo systemctl daemon-reload
$ sudo systemctl start bitcoind.service
$ sudo systemctl enable bitcoind.service
```

Check to see if it's working

```
$ bitcoin-cli -getinfo
```

You should see

```
{
  "version": 210100,
  "blocks": 0,
  "headers": 192000,
  "verificationprogress": 1.614235773073144e-08,
  "timeoffset": 0,
  "connections": {
    "in": 0,
    "out": 7,
    "total": 7
  },
  "proxy": "",
  "difficulty": 1,
  "chain": "test",
  "relayfee": 0.00001000,
  "warnings": ""
}
```

### 4. Install Nodejs (via nvm)


```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
$ source ~/.bashrc
$ nvm install 14
$ nvm use 14
```

Check to see if it's working

```
$ node -v
```

Should return a version number

```
$ v14.18.1
```

### 5. Wait for Bitcoin data to sync, and clone Ion

Before we can run ion, our bitcoin process needs to sync to a specific block height. We can check the progress with the following script. 

```
$ vim check_height.sh
--- Create File ---
#!/bin/bash

while [ true ];
do
  HEIGHT=`tail -n 1 /home/ubuntu/.bitcoin/testnet3/debug.log | grep -Po 'height=\K.*?(.{5})\s'`
  PROGRESS=`tail -n 1 /home/ubuntu/.bitcoin/testnet3/debug.log | grep -Po 'progress=\K.*?(.{5})\s'`
  if [ ${#HEIGHT} -le 0 ]; then
    continue;
  fi
  if [ $HEIGHT  -ge 1900000 ]; then
    echo "Ready!!"
    break;
  fi
  echo -n -e "Progress: $PROGRESS% Height: $HEIGHT \\r"
  sleep 1
done
--- EOF ---
$ sh check_height.sh
```

This will print out the overall progress and the height. 

```
-e Progress: 0.645228 % Height: 1410231
```

Once the minimum block height of 1900000 is reached, the script will terminate itself, letting you know you can continue. Depending on your internet connection, it is likely this step can take 2-3 hours. 

Once that is complete, we can clone and build ion to start the bitcoin and core processes in the next step. 

```
$ sudo apt-get install make gcc
$ git clone https://github.com/decentralized-identity/ion.git
$ cd ion
$ npm i
$ npm install typescript@3.9.6 -g
$ npm run build
$ sudo mkdir /etc/ion
```


### 6. Configure and run Ion "bitcoin" process

You will need to fill in your own. `bitcoinWalletOrImportString`. If a valid
one isn't provided when you run `npm run bitcoin`, a value will be generated
for you. Copy this, and edit it back into `bitcoin-config.json`. 

```
$ sudo vim /etc/ion/bitcoin-config.json
--- Create File ---
{
  "bitcoinDataDirectory": "/home/ubuntu/.bitcoin/testnet3/",
  "bitcoinFeeSpendingCutoffPeriodInBlocks": 1,
  "bitcoinFeeSpendingCutoff": 0.001,
  "bitcoinPeerUri": "http://localhost:18332",
  "bitcoinRpcUsername": "admin",
  "bitcoinRpcPassword": "keyboardcat",
  "bitcoinWalletOrImportString": "YOUR_IMPORT_STRING",
  "databaseName": "ion-testnet-bitcoin",
  "genesisBlockNumber": 1900000,
  "logRequestError": true,
  "mongoDbConnectionString": "mongodb://localhost:27017/",
  "port": 3002,
  "sidetreeTransactionFeeMarkupPercentage": 1,
  "sidetreeTransactionPrefix": "ion:",
  "transactionPollPeriodInSeconds": 60,
  "valueTimeLockUpdateEnabled": false,
  "valueTimeLockAmountInBitcoins": 0,
  "valueTimeLockPollPeriodInSeconds": 600,
  "valueTimeLockTransactionFeesAmountInBitcoins": 0.0001
}
--- EOF ---
$ sudo vim /etc/ion/bitcoin-versioning.json
--- Create File ---
[
  {
    "startingBlockchainTime": 1900000,
    "version": "1.0",
    "protocolParameters": {
      "feeLookBackWindowInBlocks": 1000,
      "feeMaxFluctuationMultiplierPerBlock": 0.00001,
      "initialNormalizedFeeInSatoshis": 400,
      "valueTimeLockDurationInBlocks": 150
    }
  }
]
--- EOF ---
$ ION_BITCOIN_CONFIG_FILE_PATH=/etc/ion/bitcoin-config.json \
ION_BITCOIN_VERSIONING_CONFIG_FILE_PATH=/etc/ion/bitcoin-versioning.json \
npm run bitcoin
```

If it's working, you should see a massive of text start to scroll on the console.

![Screenshot from 2021-10-20 05-18-54](https://user-images.githubusercontent.com/86194145/138098125-f3104bfc-645f-4ed2-90f0-57b2fff468fb.png)

Note: The first time I ran npm run bitcoin, the script can't find the wallet, and crashes. On the second run, it has generated the wallet and is able to go passed that point. Not sure if this is an auto-fail on the first run. 

Another note is that we might need to run this is a detached screen, or call the node process directly with pm2 or something. Since we need to call core after this. 

### 7. Configure and run Ion "core" process

```
$ sudo vim /etc/ion/core-config.json
--- Create File ---
{
  "batchingIntervalInSeconds": 600,
  "blockchainServiceUri": "http://127.0.0.1:3002",
  "databaseName": "ion-testnet-core",
  "didMethodName": "ion:test",
  "ipfsHttpApiEndpointUri": "http://127.0.0.1:5001",
  "maxConcurrentDownloads": 20,
  "mongoDbConnectionString": "mongodb://localhost:27017/",
  "observingIntervalInSeconds": 60,
  "port": 3000
}
-- EOF ---
$ sudo vim /etc/ion/core-versioning.json
--- Create File ---
[
  {
    "startingBlockchainTime": 1900000,
    "version": "1.0"
  }
]
-- EOF ---
$ ION_CORE_CONFIG_FILE_PATH=/etc/ion/core-config.json \
ION_CORE_VERSIONING_CONFIG_FILE_PATH=/etc/ion/core-versioning.json \
npm run core
```

if it worked, you should see a massive amount of text start to scroll on the
console. 

![Screenshot from 2021-10-20 06-17-38](https://user-images.githubusercontent.com/86194145/138098136-fef7b1a8-901a-4c93-abb1-d4a5e514616a.png)

To check if this is working, run

```
$ curl http://localhost:3000/identifiers/did:ion:test:EiClWZ1MnE8PHjH6y4e4nCKgtKnI1DK1foZiP61I86b6pw
```

At first you should get a json response that says, "not found". The process will
need to run for a while to parse data from the blockchain, and download the
ipfs data locally. Once the process has been running for a while (maybe an hour 
or more), you should get the following response. 

```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:test:EiClWZ1MnE8PHjH6y4e4nCKgtKnI1DK1foZiP61I86b6pw","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:test:EiClWZ1MnE8PHjH6y4e4nCKgtKnI1DK1foZiP61I86b6pw"}],"verificationMethod":[{"id":"#sign","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"crv":"secp256k1","kty":"EC","x":"x2ZoT2yFRMyIHKUgxCjQfpGr0jpdMy7I1qTccN8THQ4","y":"UGtsr59itS44XgMVI62geeZr52ZQ6LFCZqulDqlK1YM"}}],"authentication":["#sign"]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiBksRY4HzocVV_WCpQXJ90_FTpOfRm0Ju8kSY77BsOkzA","updateCommitment":"EiApri1a1Dg0wy7UtlVGKMxARdO5Bo0yO-YCSVU-QHx3Ig"},"canonicalId":"did:ion:test:EiClWZ1MnE8PHjH6y4e4nCKgtKnI1DK1foZiP61I86b6pw"}}
```
