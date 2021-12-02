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

**Note 1:** We will create new screens with the `$ screen -S` command
and we will use the notation of `[Control A + D]` to disconnect 
from a screen. You can can use `$ screen -ls` to list the currently
active screens and `$ screen -x [screen name]` to connect to a
screen instance running in the background. 

**Note 2:** This guide has been created to be as easy to set up 
and test with fixed values. Security has been relaxed on purpose
for demonstrative purposes. Do not use these settings in a production
or test environment .

## Section 01 Install Dependencies

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

Install Bitcoin
```
$ sudo snap install bitcoin-core
$ mkdir -P /home/ubuntu/snap/bitcoin-core/common/.bitcoin
$ vim /home/ubuntu/snap/bitcoin-core/common/.bitcoin/bitcoin.conf
--- Create File ---
regtest=1
server=1
rpcuser=admin
rpcpassword=keyboardcat
txindex=1
fallbackfee=0.001
--- EOF ---
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


Start Bitcoin-core daemon
```
$ screen -S bitcoind
[bitcoind] $ bitcoin-core.daemon
[Control A + D]
```

Create Bitcoin Wallet, generate blocks, and dump private key for address
```
$ bitcoin-core.cli createwallet sidetreeDefaultWallet
$ bitcoin-core.cli getnewaddress
bcrt1qeu3nfxjma2gvetxxzhe8ctlk6p46xlmd8y9fyl
$ bitcoin-core.cli generatetoaddress 101 bcrt1qeu3nfxjma2gvetxxzhe8ctlk6p46xlmd8y9fyl
[
  "3e8d74a700cd467ef8bd02b74c400bfc88d786cba5e5d9d18d7c1aba57dff076",
  "597d7561ae4e3881474dc830a67f12606daffca94af48f5bc90010822fd957e7",
  "40d577c0624ccc5dff4f19655ab5a75471249a1d553a8f7afec0ca6c671cbee0",
...
  "633a4deb4a95675ec7816319ed4f26584104760a38e5c01b02465eafeee22a1a"
]
$ bitcoin-core.cli getbalance
50.00000000
$ bitcoin-core.cli dumpprivkey bcrt1qeu3nfxjma2gvetxxzhe8ctlk6p46xlmd8y9fyl
cR1tGTGwMR9f2tCnWU4e7cRGeFBdsmzJ2n44ydEbcbRntHNiJMdZ
```

Clone, Configure and Build Ion
```
$ cd /home/ubuntu
$ sudo apt-get install gcc make
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
  "bitcoinFeeSpendingCutoff": 0.1,
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
  "batchingIntervalInSeconds": 60,
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

Run Ion-core process
```
$ screen -S ion-core
[ ion-core ] $ node core.js
[Control A + D]
```

## Section 03 Sending a Create Operation and Resolve Operation

```
$ curl --header "Content-Type: application/json" \
--request POST \
--data '{"type":"create","suffixData":{"deltaHash":"EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg","recoveryCommitment":"EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"},"delta":{"updateCommitment":"EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signing-key","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0","y":"zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"}}]}}]}}' \
http://localhost:3000/operations
```

Then we need to generate several blocks
```
$ for n in {1..5}; do bitcoin-core.cli -generate 1; done
```

Wait several minutes and then try and resolve
```
$ curl http://localhost:3000/identifiers/did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA
```
```
