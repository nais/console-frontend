ARG NODE_VERSION="24"

FROM node:${NODE_VERSION} AS node-with-deps
RUN corepack enable
WORKDIR /usr/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile

COPY . ./

RUN pnpm run build


FROM node:${NODE_VERSION}-alpine AS prod-deps
RUN corepack enable
WORKDIR /usr/app

COPY --from=node-with-deps \
	/usr/app/package.json \
	/usr/app/pnpm-lock.yaml \
	/usr/app/pnpm-workspace.yaml \
	/usr/app/.npmrc \
	./

COPY --from=node-with-deps /usr/app/packages/ui/package.json ./packages/ui/package.json
COPY --from=node-with-deps /usr/app/packages/ui/dist ./packages/ui/dist

RUN pnpm install --frozen-lockfile --prod --ignore-scripts


FROM node:${NODE_VERSION}-alpine

ARG APK_REFRESH

RUN echo "APK refresh: ${APK_REFRESH}" && \
	apk upgrade --no-cache && \
	rm -rf /usr/local/lib/node_modules/npm \
	/usr/local/bin/npm \
	/usr/local/bin/npx

WORKDIR /usr/app

ENV NODE_ENV=production
ENV GRAPHQL_ENDPOINT=http://nais-api/graphql

COPY --from=prod-deps /usr/app/node_modules ./node_modules
COPY --from=prod-deps /usr/app/packages ./packages
COPY --from=node-with-deps /usr/app/build ./

RUN addgroup -S appgroup && \
	adduser -S appuser -G appgroup

USER appuser

CMD ["node", "./index.js"]
