# BUILD
FROM node:22-alpine as builder

WORKDIR /opt/src

RUN apk add --no-cache bash git python3 perl alpine-sdk

COPY telepathy-server telepathy-server

RUN cd telepathy-server && \
    npm ci && \
    npm run build

COPY telepathy-web telepathy-web

RUN cd telepathy-web && \
    npm ci && \
    npm run generate

# RUN
FROM node:22-alpine

COPY --from=builder /opt/src/telepathy-server/node_modules /opt/app/telepathy/node_modules
COPY --from=builder /opt/src/telepathy-server/dist /opt/app/telepathy/dist
COPY --from=builder /opt/src/telepathy-web/.output/public /opt/app/telepathy/web
COPY telepathy-server/config.json /opt/app/telepathy/config.json
COPY telepathy-server/sql /opt/app/telepathy/sql
COPY telepathy-server/processors-system /opt/app/telepathy/processors-system
COPY telepathy-server/processors-user /opt/app/telepathy/processors-user

WORKDIR /opt/app/telepathy

CMD [ "dist/app.js" ]