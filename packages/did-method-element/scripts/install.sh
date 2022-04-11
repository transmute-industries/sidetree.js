#!/usr/bin/bash

###############################################################################
#                              HELPER FUNCTIONS                               #
###############################################################################

function checkRoot() {
	if [ "$EUID" -ne 0 ]; then
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

function checkConfirm() {
	read -p "
This is an experimental install script for setting up a Ropsten Node
Are you sure you want to continue? [y/n]" -n 1 -r
	if [[ $REPLY =~ ^[Yy]$ ]]
	then
		return 1
	fi
	exit 1
}

function installNginx() {

	read -rp "Enter Domain Name: " -e userInput
	domainName=$(echo $userInput | grep -P '(?=^.{5,254}$)(^(?:(?!\d+\.)[a-zA-Z0-9_\-]{1,63}\.?)+(?:[a-zA-Z]{2,})$)')
	if [[ $domainName == "" ]]; then
		echo "Please enter a valid domain name"
		exit 1
	fi

	apt install ufw nginx certbot python3-certbot-nginx -y
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw --force enable
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
	echo $domainName > /root/.element-domain

}

function installUpdates() {
    apt-get update
    apt-get upgrade -y
    apt-get install -y unattended-upgrades software-properties-common python-is-python3 make gcc g++ pwgen jq qrencode
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
Description=IPFS
After=network.target

[Service]
ExecStart=/usr/local/bin/ipfs daemon --migrate
Restart=always
User=root
Group=root
Restart=on-failure
KillSignal=SIGINT

[Install]
WantedBy=multi-user.target" > /lib/systemd/system/ipfs.service
	ipfs init
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

	cd /root
	git clone https://github.com/transmute-industries/sidetree.js.git element
	cd element
	npm i

    keyStore=$(ls /root/.ethereum/keystore/)
    if [[ $keyStore == "" ]]; then
        pwgen 20 1 > /root/element/password.txt
        geth account new --password /root/element/password.txt
    fi 
    keyFile=$(ls /root/.ethereum/keystore/ | head -n 1)
    address=$(cat /root/.ethereum/keystore/$keyFile | jq -r '.address')
	privateKey=$(cat /root/.ethereum/keystore/$keyFile | jq -r '.crypto.mac')

	cd packages/dashboard
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
ETHEREUM_PROVIDER=http://localhost:8545
ETHEREUM_PRIVATE_KEY=$privateKey" > .env.local

	qrencode -o public/address.png -s 10 "ethereum:0x$address"
	npm i @sidetree/wallet
	npm run build
	pm2 start npm --name "Element Dashboard" -- start
	pm2 save
	pm2 startup

	domainName=$(cat /root/.element-domain)

	echo "Your Ropsten Ethereum Address is: 0x$address"
	echo "You will need to send funds to this account to create DID's on this Node"
	echo "https://$domainName/address.png"

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

https://github.com/transmute-industries/sidetree.js
Copyright © Transmute Industries Inc. Apache-2.0 License
"

# Run Checks
checkRoot
checkOS
checkConfirm

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
