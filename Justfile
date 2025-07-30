set dotenv-load

@default:
	just -l

# For launching the authentification api
@auth $FASTIFY_LOG_LEVEL="info" $FASTIFY_PRETTY_LOGS="true":
	fastify start src/api/auth/default.js

# For launching the user data api
@user $FASTIFY_LOG_LEVEL="info" $FASTIFY_PRETTY_LOGS="true":
	fastify start src/api/user/default.js

@scoreStore $FASTIFY_LOG_LEVEL="info" $FASTIFY_PRETTY_LOGS="true":
	fastify start src/api/scoreStore/default.js

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
	docker build -t node-base -f docker/api-base/Dockerfile .

# To launch the docker compose
@docker: 
	docker compose -f docker/docker-compose.yml up -d --build

# To stop the docker compose
@stop-docker: 
	docker compose -f docker/docker-compose.yml down

# To rebuild fully the docker (use it with caution)
@re-docker: clean-docker docker

# To completely docker
@clean-docker: clean-compose
	docker system prune -af

# To clean only the container launched by the compose
@clean-compose: stop-docker
	docker compose -f docker/docker-compose.yml rm

@deploy-contract-scoreStore:
	forge create scoreStore --rpc-url=${RPC_URL} --private-key=${PRIVATE_KEY}

@verify-contract:
	forge verify-contract --chain-id 43113 --rpc-url=${AVAX_RPC_URL} --watch ${AVAX_CONTRACT_ADDR}
