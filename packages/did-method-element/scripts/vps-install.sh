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


function installUpdates() {
    apt-get update
    apt-get upgrade -y
    apt-get install -y unattended-upgrades software-properties-common python-is-python3 make gcc g++
    echo "unattended-upgrades       unattended-upgrades/enable_auto_updates boolean true" | debconf-set-selections; dpkg-reconfigure -f noninteractive unattended-upgrades
}

function setFirewall() {
    apt install ufw -y
    ufw allow ssh
    ufw allow http
    ufw allow https
    ufw enable
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


###############################################################################
#                             END INSTALLL SCRIPT                             #
###############################################################################
