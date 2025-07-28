import scoreDB from "../../utils/scoreDB.js";

/**
 *	@async
 *	@param {import("fastify".FastifyRequest)} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function getTx(request, reply, fastify) {
	try {
		
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}

