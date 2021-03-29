#!/bin/sh

# Set SEVER_URL
if [ "${SEVER_URL}" = "" ]; then
    SEVER_URL=/
fi


JSON_STRING='window.configs = { \
  "SEVER_URL":"'"${SEVER_URL}"'", \
}'
sed -i "s@// CONFIGURATIONS_PLACEHOLDER@${JSON_STRING}@" /usr/share/nginx/html/index.html
exec "$@"


# Start NGINX
nginx -g 'daemon off;'
