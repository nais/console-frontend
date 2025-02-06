FROM node:22-alpine AS node-with-deps
WORKDIR /usr/app

COPY package*.json svelte.config.js .npmrc ./

RUN npm ci --quiet

COPY . ./

ENV VITE_GRAPHQL_ENDPOINT=http://nais-api/graphql

RUN npm run build

FROM node:22-alpine
WORKDIR /usr/app

ENV NODE_ENV=production

COPY --from=node-with-deps /usr/app/package*.json /usr/app/.npmrc ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=node-with-deps /usr/app/build ./

CMD ["node", "./index.js"]
