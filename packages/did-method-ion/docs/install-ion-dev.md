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

Generate Bitcoin Blocks in the Background
```
$ screen -S bitcoin-blocks
[ bitcoin-blocks ] $ watch -n 30 bitcoin-core.cli -generate 1
[Control A + D]
```

## Section 03 Sending a Create Operation and Recover Operation

**Create Request**
```
curl --header "Content-Type: application/json" --request POST --data '{"type":"create","suffixData":{"deltaHash":"EiCP8MJ9oX2jmTxVi6xa1WoGmzkg8HaxmWWiR6R34cUmvw","recoveryCommitment":"EiCFei9R_74JeKbxGIZPI4XXwbb0eDpBeweA9IpymBEOFA"},"delta":{"updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signingKey","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"8a7JVJUDcR_mS6gyTAgdvGFZkhO8plwWfId3xqHa7xA","y":"xIxXstl9XR-hXXBkrhzxrFhJRvab2MLhQDus92S8G2o"},"purposes":["authentication","assertionMethod","capabilityInvocation","capabilityDelegation","keyAgreement"]}],"services":[{"id":"serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}]}}]}}' http://localhost:3000/operations
```

**Create Response**
```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}],"service":[{"id":"#serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}],"verificationMethod":[{"id":"#signingKey","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"8a7JVJUDcR_mS6gyTAgdvGFZkhO8plwWfId3xqHa7xA","y":"xIxXstl9XR-hXXBkrhzxrFhJRvab2MLhQDus92S8G2o"}}],"authentication":["#signingKey"],"assertionMethod":["#signingKey"],"capabilityInvocation":["#signingKey"],"capabilityDelegation":["#signingKey"],"keyAgreement":["#signingKey"]},"didDocumentMetadata":{"method":{"published":false,"recoveryCommitment":"EiCFei9R_74JeKbxGIZPI4XXwbb0eDpBeweA9IpymBEOFA","updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"},"canonicalId":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}}
```

**Resolve Request**
```
curl http://localhost:3000/identifiers/did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg
```

**Resolve Response**
```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}],"service":[{"id":"#serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}],"verificationMethod":[{"id":"#signingKey","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"8a7JVJUDcR_mS6gyTAgdvGFZkhO8plwWfId3xqHa7xA","y":"xIxXstl9XR-hXXBkrhzxrFhJRvab2MLhQDus92S8G2o"}}],"authentication":["#signingKey"],"assertionMethod":["#signingKey"],"capabilityInvocation":["#signingKey"],"capabilityDelegation":["#signingKey"],"keyAgreement":["#signingKey"]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiCFei9R_74JeKbxGIZPI4XXwbb0eDpBeweA9IpymBEOFA","updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"},"canonicalId":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}}
```

**Recover Request**
```
curl --header "Content-Type: application/json" --request POST --data '{"type":"recover","didSuffix":"EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","revealValue":"EiBDFxzWmxgVG9SH-PY-9Yz73-6mnI8egnypTx1fjlKMKw","signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkZWx0YUhhc2giOiJFaURaeXJBQk13dGZ1YmNGSXlZelhkb09wNXdObzZCNW82MGxvaUg1Qkh3VldRIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiODZzeDZ5dVdZWjVMRFp1WFd4WF9FdEtrbFN1a21jSDdQZUIzNFNrWUVjZyIsInkiOiJzVlR6VGhVejNDRk82N2doWHVIQXV6Q2ZCVWdKa0V3WkZrbzZQM0ZzNnIwIn0sInJlY292ZXJ5Q29tbWl0bWVudCI6IkVpREFUNGxlYm14S3FTOXFyT1ROZ0lOakJ1aHY1VUJWS1h3Y0NQQ0hiellNX1EifQ.w9jDo4hrTVxbA3oA7QH6YOiTSM5y1f697Dj7m4DPg3ShbhjK3KwXmrHEu5lpFXcxAFB47hW0G1rzm7PpNm9bwQ","delta":{"patches":[{"action":"replace","document":{"publicKeys":[]}}],"updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"}}' http://localhost:3000/operations
```

**Recover Response**
```
(none)
```

**Resolve Request**
```
curl http://localhost:3000/identifiers/did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg
```

**Resolve Response**
```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiDAT4lebmxKqS9qrOTNgINjBuhv5UBVKXwcCPCHbzYM_Q","updateCommitment":"EiDDJ-s9CPjkh6yaH5apLIKZ1G87K0phukB3Fofy2ujeAg"},"canonicalId":"did:ion:EiB_4F3m_qz5tBdRmC7tcMOQJxvKSyICzQ4Uxt8cGTN5Vg"}}
```

## Section 04 Sending a Create, Update and Deactivate Operation

**Create Request**
```
curl --header "Content-Type: application/json" --request POST --data '{"type":"create","suffixData":{"deltaHash":"EiB5bpeOg4EMw3rYAZ37wmdqrHAoZVf45-70EeeFBLIDxA","recoveryCommitment":"EiCYJN3wDMCQc5kJo_ZR6nNiLEukVZEd3qgTrSHQZIy-NA"},"delta":{"updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ","patches":[{"action":"replace","document":{"publicKeys":[{"id":"signingKey","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"naoGdqBTAvOAVaXjRJb_MW2BPw86iGWLs4i9ylN0dbE","y":"dOfZc0yVkTm70h_ixQOu-B_T29dzxGTILf1-xoqYeao"},"purposes":["authentication","assertionMethod","capabilityInvocation","capabilityDelegation","keyAgreement"]}],"services":[{"id":"serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}]}}]}}' http://localhost:3000/operations
```

**Create Response**

```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}],"service":[{"id":"#serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}],"verificationMethod":[{"id":"#signingKey","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"naoGdqBTAvOAVaXjRJb_MW2BPw86iGWLs4i9ylN0dbE","y":"dOfZc0yVkTm70h_ixQOu-B_T29dzxGTILf1-xoqYeao"}}],"authentication":["#signingKey"],"assertionMethod":["#signingKey"],"capabilityInvocation":["#signingKey"],"capabilityDelegation":["#signingKey"],"keyAgreement":["#signingKey"]},"didDocumentMetadata":{"method":{"published":false,"recoveryCommitment":"EiCYJN3wDMCQc5kJo_ZR6nNiLEukVZEd3qgTrSHQZIy-NA","updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"},"canonicalId":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}}
```

**Resolve Request**

```
curl http://localhost:3000/identifiers/did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A
```

**Resolve Response**
```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}],"service":[{"id":"#serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"}],"verificationMethod":[{"id":"#signingKey","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"naoGdqBTAvOAVaXjRJb_MW2BPw86iGWLs4i9ylN0dbE","y":"dOfZc0yVkTm70h_ixQOu-B_T29dzxGTILf1-xoqYeao"}}],"authentication":["#signingKey"],"assertionMethod":["#signingKey"],"capabilityInvocation":["#signingKey"],"capabilityDelegation":["#signingKey"],"keyAgreement":["#signingKey"]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiCYJN3wDMCQc5kJo_ZR6nNiLEukVZEd3qgTrSHQZIy-NA","updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"},"canonicalId":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}}
```

**Update Request**

```
curl --header "Content-Type: application/json" --request POST --data '{"type":"update","didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","revealValue":"EiD0FtXueh5RDV_DlLcOuxjPnT-pheGPfhvaYUivLpGmZA","delta":{"patches":[{"action":"add-services","services":[{"id":"someId","type":"someType","serviceEndpoint":"someEndpoint"}]}],"updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"},"signedData":"eyJhbGciOiJFUzI1NksifQ.eyJ1cGRhdGVLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiMTdOVnAwX3pwLUJON3FkeTJhbkNqcDk1TS1sVF9pZ2xpTENEZ1hvS2F6YyIsInkiOiJ4TzJPQlZSOGxFTW94N1hvYzVYU1dYSC1yUm5jbHk5b2NvTVBUVkhVZmtzIn0sImRlbHRhSGFzaCI6IkVpQ2VkUlZYWGRaU0VMSmRqNzhJclVwaFVJYkVSWFA1UWlrSTN1ZEVvSmFRcEEifQ.-oeeFd4XrAf1L9pt0V_MjXIEubqAEHKPGA1s3JnrdWLHcG3uXF2wZSI_xoDMTlRuwHkJjt-tt918Ce9OXwi4PQ"}' http://localhost:3000/operations
```

**Update Response**

```
(none)
```

**Resolve Request**
```
curl http://localhost:3000/identifiers/did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A
```

**Resolve Response**

```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}],"service":[{"id":"#serviceId123","type":"someType","serviceEndpoint":"https://www.url.com"},{"id":"#someId","type":"someType","serviceEndpoint":"someEndpoint"}],"verificationMethod":[{"id":"#signingKey","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"naoGdqBTAvOAVaXjRJb_MW2BPw86iGWLs4i9ylN0dbE","y":"dOfZc0yVkTm70h_ixQOu-B_T29dzxGTILf1-xoqYeao"}}],"authentication":["#signingKey"],"assertionMethod":["#signingKey"],"capabilityInvocation":["#signingKey"],"capabilityDelegation":["#signingKey"],"keyAgreement":["#signingKey"]},"didDocumentMetadata":{"method":{"published":true,"recoveryCommitment":"EiCYJN3wDMCQc5kJo_ZR6nNiLEukVZEd3qgTrSHQZIy-NA","updateCommitment":"EiDJa1d1800h2jcvLOJ5eoga5PrIA9WAwxrKGvUYXJwTeQ"},"canonicalId":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}}
```

**Deactivate Request**

```
curl --header "Content-Type: application/json" --request POST --data '{"type":"deactivate","didSuffix":"EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","revealValue":"EiCk-d_6aijSJVJ9K00qlfprLUew_TUZqZ4b8dtl_5mpww","signedData":"eyJhbGciOiJFUzI1NksifQ.eyJkaWRTdWZmaXgiOiJFaUJ1dWljV1Z4T2NiaENXME45WVNSSndCN2F1cWJ6aE1oS2cxcVhSVFIzMF9BIiwicmVjb3ZlcnlLZXkiOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiLUhWWFJRNVNGTnRoWFk2Mkxya3N2Z2dqdkVlaEF1Sll3bTVkS0ZZSzJ5ZyIsInkiOiJqQVVqYmo5N3I2dDNTY0pvVW1DTjRwejRpdXVpdGVrMEtKSlFaMndHU1g4In19.L9fl_GHr5jseHUckE0dx4ib-YkFiFBx5YgdFJ8_pcNa71JPTbGT2T4_WY7HUsQqBe_F-yzoDd_FozspFC2PqKw"}' http://localhost:3000/operations
```

**Deactivate Response**

```
(none)
```

**Resolve Request**

```
curl http://localhost:3000/identifiers/did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A
```

**Resolve Response**

```
{"@context":"https://w3id.org/did-resolution/v1","didDocument":{"id":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A","@context":["https://www.w3.org/ns/did/v1",{"@base":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}]},"didDocumentMetadata":{"method":{"published":true},"canonicalId":"did:ion:EiBuuicWVxOcbhCW0N9YSRJwB7auqbzhMhKg1qXRTR30_A"}}
```

