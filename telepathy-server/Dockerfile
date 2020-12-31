FROM node:alpine

COPY ./node_modules /opt/app/node_modules
COPY ./package.json /opt/app/package.json
COPY ./dist opt/app/dist

WORKDIR /opt/app

CMD [ "node", "dist/app.js" ]
