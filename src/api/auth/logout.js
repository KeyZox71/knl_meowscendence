/**
 * @async
 * @param {import("fastify").FastifyReply} reply
 * @param {import("fastify").FastifyInstance} fastify
 *
 * @returns {import("fastify").FastifyReply}
 */
export async function logout(reply, fastify) {
	try {
		return reply
			.code(200)
			.clearCookie()
			.send({ msg: "Logout successful" });
	} catch {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
