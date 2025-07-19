import authDB from "../../utils/authDB.js";
import { verifyTOTP } from "../../utils/totp.js";

/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export function totpVerify(request, reply, fastify) {
	try {
		const user = request.user;
		if (!authDB.checkUser(user)) {
			return reply.code(404).send({ error: 'User not found' });
		}

		const userTOTP = authDB.getUser(user);
		if (!userTOTP || !userTOTP.totpHash) {
			return reply.code(400).send({ error: '2FA not set up for this user' });
		}
		const isValid = verifyTOTP(userTOTP.totpHash, request.body.token);
		if (!isValid) {
			return reply.code(401).send({ error: 'Invalid 2FA token' });
		}

		authDB.enableTOTP(user); // ensures it's flagged as active

		return reply.code(200).send({ msg: '2FA verified successfully' });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
