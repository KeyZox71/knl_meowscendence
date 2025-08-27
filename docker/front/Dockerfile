FROM		alpine:3.22 AS builder

ENV			PKGS=true
ENV			TTY=true

RUN			apk add --no-cache bash clang make git

RUN			git clone --recurse-submodules https://github.com/keyzox71/webserv /build \
			&& cd /build && git checkout prod

RUN			cd /build \
			&& CXXFLAGS="-std=c++98" PKGS=true make -j re

FROM		node:lts-alpine AS builder-vite

RUN			npm install -g pnpm

WORKDIR		/app

COPY		package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN			pnpm install --frozen-lockfile

COPY		vite.config.js tailwind.config.js ./
COPY		src ./src

RUN			pnpm vite build


FROM		alpine:3.22

RUN			apk add --no-cache libstdc++ tzdata

COPY		--from=builder /build/webserv /bin/webserv

RUN			chmod +x /bin/webserv
RUN			mkdir -p /usr/share/webserv
RUN			chmod 777 /usr/share/webserv

COPY		--chmod=644 docker/front/config.toml /config.toml

COPY		--from=builder-vite /app/dist /usr/share/webserv

WORKDIR		/

CMD			[ "/bin/webserv", "/config.toml" ]
