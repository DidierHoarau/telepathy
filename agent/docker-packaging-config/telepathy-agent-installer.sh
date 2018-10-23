#!/bin/bash

set -e

# Init
if [ "$(uname -a | grep Linux | grep x86_64)" != "" ]; then
    ARCH=linux-x64
fi
if [ "$(uname -a | grep Linux | grep armv7)" != "" ]; then
    ARCH=linux-armv7
fi
if [ "${ARCH}" == "" ]; then
    echo Unsupported achitecture
    exit 1
fi
mkdir -p /opt/telepathy/
mkdir -p /etc/telepathy/
kill $(ps -ef | grep telepathy-agent | grep -v installer | tr -s " " | cut -f2 -d" ") >> /dev/null || true

# Binaries
cd /opt/telepathy/
rm -fr telepathy-agent-installer.sh
rm -fr telepathy-agent-${ARCH}
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-agent-${ARCH}
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-agent-list
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-agent-installer.sh

# Config
cd /opt/telepathy/
cat telepathy-agent-list | grep ${ARCH} | cut -f2 -d":" > version
if [ ! -f /etc/telepathy/config-agent.json ]; then
echo '{
    "UPDATE_AUTO": true,
    "UPDATE_URL_INFO": "https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-agent-list",
    "UPDATE_URL_BINARY": "https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-agent-'${ARCH}'"
}
' > /etc/telepathy/config-agent.json
fi
rm telepathy-agent-list

# Auto Run
cd /opt/telepathy/
chmod +x telepathy-agent-installer.sh
chmod +x telepathy-agent-${ARCH}
./telepathy-agent-${ARCH} &
echo '[Unit]
Description = Telepathy server
After = network.target

[Service]
ExecStart = /opt/telepathy/telepathy-agent-'${ARCH}'

[Install]
WantedBy = multi-user.target' > /etc/systemd/system/telepathy.service
systemctl enable telepathy.service
systemctl restart telepathy.service
