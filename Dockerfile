FROM node:20-alpine AS node-with-deps

WORKDIR /usr/app

COPY package*.json svelte.config.js ./

RUN npm install --quiet

RUN npm run build

FROM node-with-deps

FROM node:20-alpine
WORKDIR /usr/app

ENV NODE_ENV production

COPY --from=node-with-deps /usr/app/package*.json ./
RUN npm i --omit=dev

COPY --from=node-with-deps /usr/app/build ./

CMD node ./index.js
