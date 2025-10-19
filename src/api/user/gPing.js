/**
 *	@param {import('fastify').FastifyRequest} request
 *	@param {import('fastify').FastifyReply} reply
 *	@param {import('fastify').FastifyInstance} fastify
 */
export async function gPing(request, reply, fastify, getActivityTime) {
	try {
		const user = request.params.userId;

		const time = getActivityTime.get(user);
		console.log(time)

		return reply.code(200)
			.send({
				lastSeenTime: time.time
			});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
