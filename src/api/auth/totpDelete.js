import authDB from "../../utils/authDB.js";

/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export function totpDelete(request, reply, fastify) {
	try {
		authDB.disableTOTP(request.user);
		return reply.code(200).send({ msg: 'TOTP removed' });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
