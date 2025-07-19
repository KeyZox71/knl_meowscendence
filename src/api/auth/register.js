import bcrypt from 'bcrypt';

import { isValidString } from '../../utils/authUtils.js';
import authDB from '../../utils/authDB.js';

var env = process.env.NODE_ENV || 'development';

/**
 *	@async
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {number} saltRounds
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function register(request, reply, saltRounds, fastify) {
	try {
		/** @type {{ user: string, password: string }} */
		const { user, password } = request.body;

		if (authDB.RESERVED_USERNAMES.includes(user)) {
			return reply.code(400).send({ error: 'Reserved username' });
		}

		if (!isValidString(user) || !isValidString(password)) {
			return reply.code(400).send({ error: 'Invalid username or password' });
		} else if (authDB.checkUser(user) === true) {
			return reply.code(400).send({ error: "User already exist" });
		} else if (password.length <= 8) {
			return reply.code(400).send({ error: "Password too short" });
		} else if (password.length > 64) {
			return reply.code(400).send({ error: "Password too long" });
		}

		const hash = await bcrypt.hash(password, saltRounds);
		authDB.addUser(user, hash);

		const token = fastify.jwt.sign({ user });

		return reply
			.setCookie('token', token, {
				httpOnly: true,
				path: '/',
				secure: env !== 'development',
				sameSite: 'lax',
			})
			.code(200)
			.send({ msg: 'Register successfully' });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
