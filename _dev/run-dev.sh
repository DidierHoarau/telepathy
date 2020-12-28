#!/bin/bash

set -e

REPO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

pm2 delete all || true


# Shared Librairies
cd "${REPO_DIR}/_shared"
pm2 start init.sh --watch --name shared


# Server
cd "${REPO_DIR}/telepathy-server"
npm install
npm run dev


# Agent
cd "${REPO_DIR}/telepathy-agent"
npm install
npm run dev


# Watch log
pm2 logs
