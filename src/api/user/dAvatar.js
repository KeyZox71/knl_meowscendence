export async function dAvatar(request, reply, fastify, deleteAvatarId) {
	try {
		;
		return reply.code(200).send({ msg: "Avatar deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
