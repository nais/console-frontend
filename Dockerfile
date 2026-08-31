ARG NODE_VERSION="24"
FROM node:${NODE_VERSION} AS node-with-deps
RUN corepack enable
WORKDIR /usr/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . ./

RUN pnpm run build

FROM node:${NODE_VERSION}-alpine AS prod-deps
RUN corepack enable
WORKDIR /usr/app

COPY --from=node-with-deps /usr/app/package.json /usr/app/pnpm-lock.yaml /usr/app/pnpm-workspace.yaml /usr/app/.npmrc ./
RUN pnpm install --frozen-lockfile --prod

FROM node:${NODE_VERSION}-alpine
RUN apk upgrade --no-cache && \
	rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /usr/app

ENV NODE_ENV=production
ENV GRAPHQL_ENDPOINT=http://nais-api/graphql

COPY --from=prod-deps /usr/app/node_modules ./node_modules
COPY --from=node-with-deps /usr/app/build ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "./index.js"]
