/**
 *	@param {import('fastify').FastifyRequest} request
 *	@param {import('fastify').FastifyReply} request
 *	@param {import('fastify').Fastify} fastify
 */
export async function pPing(request, reply, fastify, setActivityTime) {
	try {
		const user = request.user;
		const currentTime = new Date().toISOString();

		setActivityTime.run(user, currentTime);

		return reply.code(200)
			.send({
				msg: "last seen time updated successfully"
			});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
