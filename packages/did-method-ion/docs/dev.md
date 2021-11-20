# Developer Node

This document will describe how to set up a developer ion node.
A developer Ion node means that we will have everything running
locally on the Raspberry Pi. And we will be using the Bitcoin
Regtest which will run a local chain where we can give ourselves
coins, and the only did documents will be the ones that we populate
and read on the chain. 

This document will be split into three sections. The first
section will cover how to install the depenencies. The second
section will cover how to run the Ion node. And the thrird
section will cover how to write an operation. Because this is a
developer install, we will not be installing services as daemons
that run in the background. We will be using Screen to keep an 
active termainl with the process running, so that we can read 
what's happening in each process to be able to debug if needed.

Note that we will create new screens with the `$ screen -S` command
and we will use the notation of `[Control A + D]` to disconnect 
from a screen. You can can use `$ screen -ls` to list the currently
active screens and `$ screen -x [screen name]` to connect to a
screen instance running in the background. 

## Section 01 Install Dependencies

Install IPFS
```
$ sudo snap install ipfs
$ ipfs init
```

Install Bitcoin
```
$ sudo snap install bitcoin-core
```

Install Node
```
$ curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```

Install and enable MongoDB
```
$ wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
$ echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
$ sudo apt-get update
$ sudo apt-get install -y mongodb-org
$ sudo systemctl daemon-reload
$ sudo systemctl enable mongod.service
$ sudo systemctl start mongod.service
```


## Section 02 Running a node

First start running IPFS in the background
```
$ screen -S ipfs
[ipfs] $ ipfs daemon
[Control A + D]
```

Define Bitcoin-core config
```
$ vim /home/ubuntu/snap/bitcoin-core/common/.bitcoin/bitcoin.conf
--- Create File ---
regtest=1
server=1
rpcuser=admin
rpcpassword=keyboardcat
txindex=1
rpcallowip=127.0.0.1/32
--- EOF ---
```

Start Bitcoin-core daemon
```
$ screen -S bitcoind
[bitcoind] $ bitcoin-core.daemon
[Control A + D]
```

Create Bitcoin Wallet, generate blocks, and dump private key for address
```
$ bitcoin-core.cli createwallet ion-dev
$ bitcoin-core.cli getnewaddress
bcrt1qjglqvdy353kwrrgx8kljva26v60ltuwwtgw4eh
$ bitcoin-core.cli generatetoaddress 101 bcrt1qjglqvdy353kwrrgx8kljva26v60ltuwwtgw4eh
[
  "3e8d74a700cd467ef8bd02b74c400bfc88d786cba5e5d9d18d7c1aba57dff076",
  "597d7561ae4e3881474dc830a67f12606daffca94af48f5bc90010822fd957e7",
  "40d577c0624ccc5dff4f19655ab5a75471249a1d553a8f7afec0ca6c671cbee0",
...
  "633a4deb4a95675ec7816319ed4f26584104760a38e5c01b02465eafeee22a1a"
]
$ bitcoin-core.cli getbalance
50.00000000
$ bitcoin-core.cli dumpprivkey bcrt1qjglqvdy353kwrrgx8kljva26v60ltuwwtgw4eh
cPTtDj4iqKueHm3iigvDYkWF3UiyXDckNnUXcH6a2QGdti8avNUH
```

Clone, Configure and Build Ion
```
$ cd /home/ubuntu
$ sudo apt-get install make
$ git clone https://github.com/decentralized-identity/ion.git
$ cd ion
$ npm install
$ mv json config
$ mkdir json
$ vim json/testnet-bitcoin-config.json
--- File Content ---
{
  "bitcoinDataDirectory": "/home/ubuntu/snap/bitcoin-core/common/.bitcoin/regtest",
  "bitcoinFeeSpendingCutoffPeriodInBlocks": 1,
  "bitcoinFeeSpendingCutoff": 0.001,
  "bitcoinPeerUri": "http://localhost:18443",
  "bitcoinRpcUsername": "admin",
  "bitcoinRpcPassword": "keyboardcat",
  "bitcoinWalletOrImportString": "cPTtDj4iqKueHm3iigvDYkWF3UiyXDckNnUXcH6a2QGdti8avNUH",
  "databaseName": "ion-regtest-bitcoin",
  "genesisBlockNumber": 100,
  "logRequestError": true,
  "mongoDbConnectionString": "mongodb://localhost:27017/",
  "port": 3002,
  "sidetreeTransactionFeeMarkupPercentage": 1,
  "sidetreeTransactionPrefix": "ion:",
  "transactionPollPeriodInSeconds": 60,
  "valueTimeLockUpdateEnabled": false,
  "valueTimeLockAmountInBitcoins": 0,
  "valueTimeLockPollPeriodInSeconds": 600 ,
  "valueTimeLockTransactionFeesAmountInBitcoins": 0.0001
}
--- EOF ---
$ vim json/testnet-bitcoin-versioning.json
--- File Content ---
[
  {
    "startingBlockchainTime": 100,
    "version": "latest",
    "protocolParameters": {
      "feeLookBackWindowInBlocks": 1000,
      "feeMaxFluctuationMultiplierPerBlock": 0.00001,
      "initialNormalizedFeeInSatoshis": 400,
      "valueTimeLockDurationInBlocks": 150
    }
  }
]
--- EOF ---
$ vim json/testnet-core-config.json
--- File Content ---
{
  "batchingIntervalInSeconds": 600,
  "blockchainServiceUri": "http://127.0.0.1:3002",
  "databaseName": "ion-regtest-core",
  "didMethodName": "ion",
  "ipfsHttpApiEndpointUri": "http://127.0.0.1:5001",
  "maxConcurrentDownloads": 20,
  "mongoDbConnectionString": "mongodb://localhost:27017/",
  "observingIntervalInSeconds": 60,
  "port": 3000
}
--- EOF ---
$ vim json/testnet-core-versioning.json
--- File Content ---
[
  {
    "startingBlockchainTime": 100,
    "version": "latest"
  }
]
--- EOF ---
$ npm run build
```

Run Ion-bitcoin process
```
$ cd dist/src
$ screen -S ion-bitcoin
[ ion-bitcoin ] $ node bitcoin.js
[Control A + D]
```

Run Ion-core procee
```
$ screen -S ion-core
[ ion-core ] $ node core.js
[Control A + D]
```
