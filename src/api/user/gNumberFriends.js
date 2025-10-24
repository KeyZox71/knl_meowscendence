export async function gNumberFriends(request, reply, fastify, getUserInfo, getNumberFriends) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}

		const row = getNumberFriends.get(userId);
		return reply.code(200).send({ n_friends: row.n_friends });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
