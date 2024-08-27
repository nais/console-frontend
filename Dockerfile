FROM cgr.dev/chainguard/node:latest-dev AS node-with-deps
WORKDIR /usr/app

COPY package*.json svelte.config.js ./

RUN npm ci --quiet --legacy-peer-deps

COPY . ./

ENV VITE_GRAPHQL_ENDPOINT http://nais-api/query

RUN npm run build

FROM cgr.dev/chainguard/node
WORKDIR /usr/app

ENV NODE_ENV production

COPY --from=node-with-deps /usr/app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=node-with-deps /usr/app/build ./

ENTRYPOINT node ./index.js
