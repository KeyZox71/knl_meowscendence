@default:
	just -l

# For launching the authentification api
@auth $FASTIFY_LOG_LEVEL="info" $FASTIFY_PRETTY_LOGS="true":
	fastify start src/api/auth/default.js
# For launching the user data api
@user $FASTIFY_LOG_LEVEL="info" $FASTIFY_PRETTY_LOGS="true":
	fastify start src/api/user/default.js

# To launch all apis
@apis:
	node src/dev.js

# To launch the front end
@front:
	vite
# To build the front end
@build-front:
	@vite build

# To build the base of the for the fastify docker images
@build-node-base:
	docker build -t node-base -f docker/node-base/Dockerfile .

@docker: build-node-base
	docker compose -f docker/docker-compose.yml up -d user-api --build

@clean-docker:
	docker system prune -af

@clean-compose:
	docker compose -f docker/docker-compose.yml rm
