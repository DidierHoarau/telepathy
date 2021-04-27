#!/bin/bash

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd ${REPO_DIR}

echo "=== Pull Latest Base Images ==="
docker pull node:alpine
docker pull node:14-alpine
docker pull node:14
docker pull nginx:alpine
docker pull alpine
docker pull ubuntu

# echo "=== Telepathy Agent Alpine ==="
docker build -f Dockerfile-agent-alpine -t didierhoarau/telepathy-agent:latest .
docker tag didierhoarau/telepathy-agent:latest didierhoarau/telepathy-agent:alpine
docker push didierhoarau/telepathy-agent:latest
docker push didierhoarau/telepathy-agent:alpine
echo IMAGE_SIZE_AGENT_ALPINE: $(docker images | grep "didierhoarau/telepathy-agent" | grep latest | tr -s ' ' | cut -d' ' -f7)

# echo "=== Telepathy Agent Ubuntu ==="
docker build -f Dockerfile-agent-ubuntu -t didierhoarau/telepathy-agent:ubuntu .
docker push didierhoarau/telepathy-agent:ubuntu
echo IMAGE_SIZE_AGENT_UBUNTU: $(docker images | grep "didierhoarau/telepathy-agent" | grep ubuntu | tr -s ' ' | cut -d' ' -f7)

echo "=== Telepathy Server ==="
docker build -f Dockerfile-server-alpine -t didierhoarau/telepathy-server:latest .
docker push didierhoarau/telepathy-server:latest
docker tag didierhoarau/telepathy-server:latest didierhoarau/telepathy-server:alpine
docker push didierhoarau/telepathy-server:alpine
echo IMAGE_SIZE_SERVER: $(docker images | grep "didierhoarau/telepathy-server" | grep latest | tr -s ' ' | cut -d' ' -f7)

# echo "=== Telepathy Web ==="
docker build -f Dockerfile-web -t didierhoarau/telepathy-web:latest .
docker push didierhoarau/telepathy-web:latest
echo IMAGE_SIZE_Web: $(docker images | grep "didierhoarau/telepathy-web" | grep latest | tr -s ' ' | cut -d' ' -f7)