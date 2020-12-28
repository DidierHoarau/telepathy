#!/bin/bash

rm -fr ../telepathy-server/src/utils-std-ts
cp -R utils-std-ts ../telepathy-server/src/utils-std-ts

rm -fr ../telepathy-agent/src/utils-std-ts
cp -R utils-std-ts ../telepathy-agent/src/utils-std-ts
