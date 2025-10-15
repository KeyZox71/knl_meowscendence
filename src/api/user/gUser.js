export async function gUser(request, reply, fastify, getUserInfo) {
	try {
		const userId = request.params.userId;
		const userInfo = getUserInfo.get(userId);
		if (!userInfo) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		return reply.code(200).send({ username: userInfo.username, displayName: userInfo.displayName, wins: userInfo.wins, losses: userInfo.losses });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
