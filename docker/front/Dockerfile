FROM		node:lts-alpine AS builder

RUN			npm install -g pnpm

WORKDIR		/app

COPY		package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN			pnpm install --frozen-lockfile

COPY		vite.config.js tailwind.config.js ./
COPY		src ./src

RUN			pnpm vite build

FROM		owasp/modsecurity-crs:nginx-alpine

RUN			mkdir -p /etc/nginx/modsecurity.d \
			&& cp /etc/modsecurity.d/unicode.mapping /etc/nginx/modsecurity.d/unicode.mapping

COPY		docker/front/config/default.conf.template \
			/etc/nginx/templates/conf.d/default.conf.template

COPY		--chmod=755 docker/front/entry/ssl-cert.sh /docker-entrypoint.d/ssl-cert.sh

COPY		--from=builder /app/dist /usr/share/nginx/html

EXPOSE		80 443
STOPSIGNAL	SIGINT
