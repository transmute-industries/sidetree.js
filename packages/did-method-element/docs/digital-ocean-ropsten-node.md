# Digital Ocean Ropsten Node

## Requirements

- 4GB of RAM
- 80GB of Storage

## Install Requirements

```
# apt-get update
# apt-get upgrade
# apt-get install -y unattended-upgrades software-properties-common python-is-python3 make gcc g++
# dpkg-reconfigure unattended-upgrades
```

### Enable Firewall

```
# ufw allow ssh
# ufw allow http
# ufw allow https
# ufw enable
```

### MongoDB Service

```
# wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
# echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.4.list
# apt-get update
# apt-get install -y mongodb-org
# systemctl daemon-reload
# systemctl enable mongod.service
# systemctl start mongod.service
```

### IPFS Service

```
# cd /tmp
# wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
# tar -xzf go-ipfs_v0.12.0_linux-amd64.tar.gz && cd go-ipfs
# bash install.sh
# sysctl -w net.core.rmem_max=2500000
# vim /lib/systemd/system/ipfs.service
--- Create File ---
[Unit]
Description=IPFS
[Service]
ExecStart=/usr/local/bin/ipfs daemon --init --migrate
Restart=always
User=root
Group=root
Restart=on-failure
KillSignal=SIGINT
[Install]
WantedBy=multi-user.target
--- EOF ---
# systemctl daemon-reload
# systemctl enable ipfs
# systemctl start ipfs
```

### Ethereum Ledger Service

```
# add-apt-repository -y ppa:ethereum/ethereum
# apt-get update
# apt-get -y install ethereum
# vim /lib/systemd/system/ropsten.service
--- Create File ---
[Unit]
Description=Ropsten
[Service]
ExecStart=/usr/bin/geth --syncmode light --ropsten --http
Restart=always
User=root
Group=root
Restart=on-failure
KillSignal=SIGINT
[Install]
WantedBy=multi-user.target
--- EOF ---
# systemctl daemon-reload
# systemctl enable ropsten
# systemctl start ropsten
```

## Install Nodejs

```
# curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
# apt-get install -y nodejs
# npm install pm2 -g
```

## Build and Run

```
# cd ~
# git clone https://github.com/transmute-industries/sidetree.js.git
# cd sidetree.js/packages/dashboard
# npm i
# vim .env.local
--- Create File ---
SIDETREE_METHOD=elem:ropsten
DESCRIPTION="Sidetree on Ethereum Ledger and IPFS Cas"

# Sidetree Variables
MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017/
DATABASE_NAME=element-ropsten
MAX_CONCURRENT_DOWNLOADS=20
BATCH_INTERVAL_IN_SECONDS=5
OBSERVING_INTERVAL_IN_SECONDS=5

# Element Node Variables
ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI=/ip4/127.0.0.1/tcp/5001
ELEMENT_ANCHOR_CONTRACT=0x920b7DEeD5CdE055260cdDBD70C000Bbd5b30997
ETHEREUM_RPC_URL=http://localhost:8545
ETHEREUM_PROVIDER=$ETHEREUM_RPC_URL
ETHEREUM_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
--- EOF ---
# npm run build
# pm2 start npm --name "Element Dashboard" -- start
# pm2 save
# pm2 startup
```

## Setup Domain with Nginx and Let's Encrypt

```
# apt-get install -y nginx
# vim /etc/nginx/sites-enabled/element
--- Create File ---
server {
    listen 80;
    listen [::]:80;

    server_name YOUR_DOMAIN_NAME;
    root /var/www/html;

    location ^~ /.well-known/acme-challenge/ {
        try_files $uri $uri/ =404;    
    }
    
    location / {
        proxy_pass http://localhost:3000/;
    }
}
--- EOF ---
# apt install -y certbot python3-certbot-nginx
# certbot --nginx -d YOUR_DOMAIN_NAME --non-interactive --agree-tos --register-unsafely-without-email --redirect
```