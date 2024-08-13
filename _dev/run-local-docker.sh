#!/bin/bash

set -e

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

docker rm -f telepathy > /dev/null || true

docker build -t telepathy -f Dockerfile-server .

docker run --name telepathy -d -p 80:80 telepathy

docker exec -ti telepathy pm2 logs
