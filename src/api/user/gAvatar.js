export async function gAvatar(request, reply, fastify, getAvatarId) {
	try {
		;
		return reply.code(200).send({  });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
