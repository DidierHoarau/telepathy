#!/bin/bash

set -e

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd ${REPO_DIR}

SERVICE_NAME="telepathy"
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:?DOCKER_HUB_USERNAME is required}"
SERVICE_VERSION=$(cat ${REPO_DIR}/package.json | jq -r '.version')
SERVICE_VERSION_MAJOR=$(cat ${REPO_DIR}/package.json | grep \"version\" | cut -f4 -d"\"" | cut -f1 -d".")
SERVICE_VERSION_MINOR=$(cat ${REPO_DIR}/package.json | grep \"version\" | cut -f4 -d"\"" | cut -f1-2 -d".")



echo "Building ${SERVICE_NAME}/${SERVICE_VERSION}"

docker buildx build \
  --platform linux/arm64/v8,linux/amd64 \
   --push \
  -f Dockerfile-server \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}:latest \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}:${SERVICE_VERSION} \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}:${SERVICE_VERSION_MAJOR} \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}:${SERVICE_VERSION_MINOR} \
  .

docker buildx build \
  --platform linux/arm64/v8,linux/amd64 \
   --push \
  -f Dockerfile-agent-alpine \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:latest \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION} \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION_MAJOR} \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION_MINOR} \
  .

docker buildx build \
  --platform linux/arm64/v8,linux/amd64 \
   --push \
  -f Dockerfile-agent-ubuntu \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION}-ubuntu \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION_MAJOR}-ubuntu \
  -t ${DOCKER_HUB_USERNAME}/${SERVICE_NAME}-agent:${SERVICE_VERSION_MINOR}-ubuntu \
  .
