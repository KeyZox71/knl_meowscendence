export async function dFriends(request, reply, fastify, getUserInfo, deleteFriends) {
	try {
		if (!request.user) {
			return reply.code(400).send({ error: "Please specify a user" });
		}
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		if (request.user !== 'admin' && request.user !== userId) {
			return reply.code(401).send({ error: "Unauthorized" });
		}
		deleteFriends.run(userId);
		return reply.code(200).send({ msg: "Friends deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
