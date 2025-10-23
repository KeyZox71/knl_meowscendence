import authDB from '../../utils/authDB.js';

/**
 *	@param {import('fastify').FastifyRequest} request
 *	@param {import('fastify').FastifyReply} reply
 */
export async function totpCheck(request, reply) {
	try {
		const user = request.user;

		if (authDB.checkUser(user) === false) {
			return reply.code(400).send({ error: "User does not exist" });
		}

		return reply
			.code(200)
			.send({
				totp: authDB.isTOTPEnabled(user)
			});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
