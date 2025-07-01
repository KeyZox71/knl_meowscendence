export FASTIFY_PRETTY_LOGS := "true"
export FASTIFY_PORT := "3001"
export FASTIFY_LOG_LEVEL := "info"

auth:
	fastify start src/api/auth/default.js

user:
	fastify start src/api/user/default.js

apis:
	node dev.js
