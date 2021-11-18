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

Clone Ion
```
$ cd /home/ubuntu
$ git clone https://github.com/decentralized-identity/ion.git
$ cd ion
$ npm install
```

## Section 02 Running a node
