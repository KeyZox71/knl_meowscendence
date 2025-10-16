import authDB from '../../utils/authDB';
import { authUserRemove } from '../../utils/authUserRemove';

/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function remove(request, reply, fastify) {
	try {
		const user = request.user;

		if (authDB.RESERVED_USERNAMES.includes(user)) {
			return reply.code(400).send({ error: 'Reserved username' });
		}

		if (authDB.checkUser(user) === false) {
			return reply.code(400).send({ error: "User does not exist" });
		}

		authDB.rmUser(user)

		authUserRemove(user, fastify)

		return reply
			.code(200)
			.send({
				msg: "User successfully deleted"
			})
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
