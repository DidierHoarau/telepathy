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
cd /opt/telepathy/
kill $(ps -ef | grep telepathy-client | grep -v installer | tr -s " " | cut -f2 -d" ") >> /dev/null || true

# Binaries
rm -fr telepathy-client-installer.sh
rm -fr telepathy-client-${ARCH}
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-client-${ARCH}
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-client-list
wget https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-client-installer.sh

# Config
cat telepathy-client-list | grep ${ARCH} | cut -f2 -d":" > version
if [ ! -f /etc/telepathy/config-client.json ]; then
echo '{
    "UPDATE_AUTO": true,
    "UPDATE_URL_INFO": "https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-list",
    "UPDATE_URL_BINARY": "https://s3-ap-southeast-1.amazonaws.com/telepathy-dist/telepathy-client-linux-x64"
}
' > /etc/telepathy/config-client.json
fi

# Run
chmod +x telepathy-client-installer.sh
chmod +x telepathy-client-${ARCH}
./telepathy-client-${ARCH} &
