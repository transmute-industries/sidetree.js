# Development Install

This guide will describe how to install and run Element locally on a Linux machine
running Unbuntu 20.04.3 on either an x86_64 machine, or Raspberry Pi 4. This guide
will use the example name of `ubuntu` (with lower-case `u`) to describe the user
and default home directory of `/home/ubuntu`. 

## Table of Contents

- Install Dependencies
- Clone and Build the Repository
- Start Required Services
- Run Test API

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
