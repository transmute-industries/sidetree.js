#!/usr/bin/bash

###############################################################################
#                              HELPER FUNCTIONS                               #
###############################################################################

function checkRoot() {
	if [ "$EUID" -ne 0 ]
        echo "Sorry, you need to run this as root"
		exit 1
    fi
}

function checkOS() {
	if [[ -e /etc/debian_version ]]; then
		OS="debian"
		source /etc/os-release

		if [[ $ID == "debian" || $ID == "raspbian" ]]; then
			if [[ $VERSION_ID -lt 10 ]]; then
				echo "⚠️ Your version of Debian is not supported."
				echo "However you can continue, at your own risk."
				until [[ $CONTINUE =~ (y|n) ]]; do
					read -rp "Continue? [y/n]: " -e CONTINUE
				done
				if [[ $CONTINUE == "n" ]]; then
					exit 1
				fi
			fi
		elif [[ $ID == "ubuntu" ]]; then
			if [[ $VERSION_ID != '20.04' ]]; then
				echo "⚠️ Your version of Ubuntu is not supported."
				echo "However you can continue, at your own risk."
				until [[ $CONTINUE =~ (y|n) ]]; do
					read -rp "Continue? [y/n]: " -e CONTINUE
				done
				if [[ $CONTINUE == "n" ]]; then
					exit 1
				fi
			fi
		fi
	else
		echo "Looks like you aren't running this installer on a Debian 11 or Ubuntu 20.04 LTS"
		exit 1
	fi
}

function installNginx() {

	read -rp "Enter Domain Name: " -e userInput
	$domainName = echo $userInput | grep -P '(?=^.{5,254}$)(^(?:(?!\d+\.)[a-zA-Z0-9_\-]{1,63}\.?)+(?:[a-zA-Z]{2,})$)'
	if [[ $domainName == "" ]]; then
		echo "Please enter a valid domain name"
		exit 1
	fi

	apt install ufw nginx certbot python3-certbot-nginx -y
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw enable
	systemctl start nginx
	systemctl enable nginx

	echo "server {
    listen 80;
    listen [::]:80;
    server_name $domainName;
    root /var/www/html;
    location ^~ /.well-known/acme-challenge/ {
        try_files $uri $uri/ =404;
    }
    location / {
        proxy_pass http://localhost:3000/;
    }
}" > /etc/nginx/sites-enabled/element
	certbot --nginx -d $domainName --non-interactive --agree-tos --register-unsafely-without-email --redirect

}

function installUpdates() {
    apt-get update
    apt-get upgrade -y
    apt-get install -y unattended-upgrades software-properties-common python-is-python3 make gcc g++
    echo "unattended-upgrades       unattended-upgrades/enable_auto_updates boolean true" | debconf-set-selections; dpkg-reconfigure -f noninteractive unattended-upgrades
}

function installNodejs() {
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt-get install -y nodejs
    npm install pm2 -g
}  

function installMongoDB() {
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.4.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl daemon-reload
    systemctl enable mongod.service
    systemctl start mongod.service
}

function installIpfs() {
    cd /tmp
    wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
    tar -xzf go-ipfs_v0.12.0_linux-amd64.tar.gz && cd go-ipfs
    bash install.sh
    sysctl -w net.core.rmem_max=2500000
    echo "[Unit]
description=ipfs p2p daemon
After=network.target
Requires=network.target

[Service]
Type=simple
User=ipfs
RestartSec=1
Restart=always
PermissionsStartOnly=true
Nice=18
StateDirectory=/var/lib/ipfs
Environment=IPFS_PATH=/var/lib/ipfs
Environment=HOME=/var/lib/ipfs
LimitNOFILE=8192
Environment=IPFS_FD_MAX=8192
EnvironmentFile=-/etc/sysconfig/ipfs
StandardOutput=journal
WorkingDirectory=/var/lib/ipfs
ExecStartPre=-adduser --system --group --home /var/lib/ipfs ipfs
ExecStartPre=-mkdir /var/lib/ipfs
ExecStartPre=-/bin/chown ipfs:ipfs /var/lib/ipfs
ExecStartPre=-/bin/chmod ug+rwx /var/lib/ipfs
ExecStartPre=-chpst -u ipfs /usr/local/bin/ipfs init --profile=badgerds
ExecStartPre=-chpst -u ipfs /usr/local/bin/ipfs config profile apply server
ExecStartPre=-chpst -u ipfs /usr/local/bin/ipfs config profile apply local-discovery
ExecStartPre=-chpst -u ipfs /usr/local/bin/ipfs config Datastore.StorageMax "5GB"
ExecStart=/usr/local/bin/ipfs daemon --enable-namesys-pubsub --enable-pubsub-experiment

[Install]
WantedBy=multi-user.target" > /lib/systemd/system/ipfs.service
    systemctl daemon-reload
    systemctl enable ipfs
    systemctl start ipfs
}

function installEthereum() {

	add-apt-repository -y ppa:ethereum/ethereum
	apt-get update
	apt-get -y install ethereum

	echo "[Unit]
Description=Ropsten
After=network.target

[Service]
ExecStart=/usr/bin/geth --syncmode light --ropsten --http
Restart=always
User=root
Group=root
Restart=on-failure
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target" > /lib/systemd/system/ropsten.service
	systemctl daemon-reload
	systemctl enable ropsten
	systemctl start ropsten

}

installDashboard() {

	cd /tmp
	git clone https://github.com/transmute-industries/sidetree.js.git
	mv sidetree.js/packages/dashboard /root/element
	rm -rf sidetree.js
	cd /root/element
	npm i
	echo "SIDETREE_METHOD=elem:ropsten
DESCRIPTION='Sidetree on Ethereum Ledger and IPFS Cas'

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
ETHEREUM_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE" > .env.local
	npm run build
	pm2 start npm --name "Element Dashboard" -- start
	pm2 save
	pm2 startup
}


###############################################################################
#                            START INSTALLL SCRIPT                            #
###############################################################################

echo "
███████╗██╗░░░░░███████╗███╗░░░███╗███████╗███╗░░██╗████████╗
██╔════╝██║░░░░░██╔════╝████╗░████║██╔════╝████╗░██║╚══██╔══╝
█████╗░░██║░░░░░█████╗░░██╔████╔██║█████╗░░██╔██╗██║░░░██║░░░
██╔══╝░░██║░░░░░██╔══╝░░██║╚██╔╝██║██╔══╝░░██║╚████║░░░██║░░░
███████╗███████╗███████╗██║░╚═╝░██║███████╗██║░╚███║░░░██║░░░
╚══════╝╚══════╝╚══════╝╚═╝░░░░░╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░
Copyright © Transmute Industries Inc. Apache-2.0
"

# Run Checks
checkRoot
checkOS

# Run Installs
installNginx
installUpdates
installNodejs
installMongoDB
installIpfs
installEthereum
installDashboard

###############################################################################
#                             END INSTALLL SCRIPT                             #
###############################################################################
