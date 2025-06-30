export FASTIFY_PRETTY_LOGS := "true"
export FASTIFY_PORT := "3001"
export FASTIFY_LOG_LEVEL := "info"

auth:
	fastify start src/api/auth/default.js
