FROM node:20-alpine AS node-with-deps

WORKDIR /usr/app/frontend

COPY frontend/package*.json frontend/svelte.config.js ./

RUN npm install --quiet

COPY ./frontend .

RUN npm run build

FROM node-with-deps

FROM node:20-alpine
WORKDIR /usr/app

ENV NODE_ENV production

COPY --from=node-with-deps /usr/app/frontend/package*.json ./
RUN npm i --omit=dev

COPY --from=node-with-deps /usr/app/frontend/dist ./

CMD node ./index.js
