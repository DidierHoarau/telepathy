#!/bin/bash

set -e


REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd ${REPO_DIR}

mkdir -p ../builds/

# Client

cd client
npm install
npm run packaging:init

npm run binary:linux:x64
npm run binary:linux:armv7