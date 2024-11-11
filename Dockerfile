FROM node:21-alpine AS node-with-deps
WORKDIR /usr/app

COPY package*.json svelte.config.js ./

RUN npm ci --quiet --legacy-peer-deps

COPY . ./

ENV VITE_GRAPHQL_ENDPOINT http://nais-api-test/graphql

RUN npm run build

FROM node:21-alpine
WORKDIR /usr/app

ENV NODE_ENV production

COPY --from=node-with-deps /usr/app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=node-with-deps /usr/app/build ./

CMD node ./index.js
