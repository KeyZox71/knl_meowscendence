export async function dAvatar(request, reply, fastify, getUserInfo, deleteAvatarId) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.cose(404).send({ error: "User does not exist" });
		}
		deleteAvatarId.run(userId);
		return reply.code(200).send({ msg: "Avatar deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
