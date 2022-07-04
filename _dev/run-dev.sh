#!/bin/bash

set -e

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

pm2 delete all || true

# Server
cd "${REPO_DIR}/telepathy-server"
npm install

# Agent
cd "${REPO_DIR}/telepathy-agent"
npm install

# Web
cd "${REPO_DIR}/telepathy-web"
npm install

# Start
cd "${REPO_DIR}"
pm2 start ecosystem.config.js --env development
pm2 logs
