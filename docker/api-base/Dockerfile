FROM		node:lts-alpine AS builder

# copy all the nessecary file to download the dependency
COPY		package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

# install all the dependency
RUN			npm install -g pnpm
RUN			cd /app \
			&& pnpm install --prod

FROM		node:lts-alpine AS base

# copy the source files
COPY		src /app/src

# copy the downloaded files
COPY		--from=builder /app/node_modules /app/node_modules
COPY		--from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY		--from=builder /app/package.json /app/package.json

ENV			NODE_ENV=production
EXPOSE		3000

RUN			mkdir /db

STOPSIGNAL	SIGINT

CMD			[ "node", "/app/src/start.js" ]
