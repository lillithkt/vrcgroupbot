FROM node:21.5.0-alpine

ENV NODE_ENV=development

RUN npm install -g pnpm
WORKDIR /src
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

FROM node:21.5.0-alpine

RUN apk add --no-cache tzdata
ENV TZ=America/New_York

ENV NODE_ENV=production

WORKDIR /dist
COPY docker-entrypoint.sh ./
COPY --from=0 /src/package.json /src/pnpm-lock.yaml ./
COPY --from=0 /src/node_modules ./node_modules
COPY --from=0 /src/dist/* ./

CMD ["./docker-entrypoint.sh"]