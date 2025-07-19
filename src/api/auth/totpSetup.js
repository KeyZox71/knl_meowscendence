import authDB from '../../utils/authDB.js';
import { appName } from './default.js';
import { generateRandomSecret } from '../../utils/totp.js';

/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function totpSetup(request, reply, fastify) {
	try {
		const username = request.user;

		if (!authDB.checkUser(username)) {
			return reply.code(404).send({ error: "User not found" });
		}

		const secret = generateRandomSecret();

		const otpauthUrl = `otpauth://totp/${encodeURI(appName)}:${encodeURI(username)}?secret=${secret}&issuer=${encodeURI(appName)}`;

		authDB.setTOTPSecret(username, secret);

		return reply.send({
			secret,
			otpauthUrl
		});
	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
