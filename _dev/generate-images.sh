#!/bin/bash

set -e

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd ${REPO_DIR}

function buildService {
    SERVICE_BASE_NAME=${1}
    SERVICE_NAME="telepathy-${1}"
    OS_VARIANT=${2}
    EXTRA_TAG=${3}
    SERVICE_VERSION=$(cat ${REPO_DIR}/${SERVICE_NAME}/package.json | jq -r '.version')
    SERVICE_VERSION_MAJOR=$(cat ${REPO_DIR}/${SERVICE_NAME}/package.json | grep \"version\" | cut -f4 -d"\"" | cut -f1 -d".")
    SERVICE_VERSION_MINOR=$(cat ${REPO_DIR}/${SERVICE_NAME}/package.json | grep \"version\" | cut -f4 -d"\"" | cut -f1-2 -d".")
    echo "Building ${SERVICE_NAME}/${SERVICE_VERSION}/${SERVICE_VERSION_MAJOR}/${SERVICE_VERSION_MINOR} - ${OS_VARIANT} - ${TAG}"
    docker build -f Dockerfile-${SERVICE_BASE_NAME}-alpine -t didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION} .
    docker push didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION}
    docker tag didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION} didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION_MAJOR}
    docker push didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION_MAJOR}
    docker tag didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION} didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION_MINOR}
    docker push didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION_MINOR}
    if [ "${EXTRA_TAG}" != "" ]; then
        echo docker tag didierhoarau/telepathy-${SERVICE_BASE_NAME}:${SERVICE_VERSION} didierhoarau/telepathy-${SERVICE_BASE_NAME}:${EXTRA_TAG}
        echo docker push didierhoarau/telepathy-${SERVICE_BASE_NAME}:${EXTRA_TAG}
    fi
}


buildService agent alpine
buildService agent ubuntu
buildService server alpine
buildService server ubuntu
buildService web alpine
