import bcrypt from 'bcrypt';

import authDB from '../../utils/authDB.js';
import { verifyTOTP } from "../../utils/totp.js";

var env = process.env.NODE_ENV || 'development';

/**
 *	@async
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function login(request, reply, fastify) {
	try {
		/** @type {{ user: string, password: string }} */
		const { user, password } = request.body;

		if (!authDB.checkUser(user) || authDB.RESERVED_USERNAMES.includes(user)) {
			return reply.code(400).send({ error: "User does not exist" });
		}

		const query = authDB.passwordQuery(user);
		const hash = query?.passwordHash;

		if (!hash) {
			return reply.code(500).send({ error: "No password was found" });
		}

		const compare = await bcrypt.compare(password, hash);

		if (!compare) {
			return reply.code(401).send({ error: "Incorrect password" });
		}

		const userTOTP = authDB.getUser(user);
		if (userTOTP.totpEnabled == 1) {
			if (!request.body.token){
				return reply.code(401).send({ error: 'Invalid 2FA token' });
			}
			const isValid = verifyTOTP(userTOTP.totpHash, request.body.token);
			if (!isValid) {
				return reply.code(401).send({ error: 'Invalid 2FA token' });
			}
		}

		const token = fastify.jwt.sign({ user });

		return reply
			.setCookie('token', token, {
				httpOnly: true,
				path: '/',
				secure: env !== 'development',
				sameSite: 'lax',
			})
			.code(200)
			.send({ msg: "Login successful" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
