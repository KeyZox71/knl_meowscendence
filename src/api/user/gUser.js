export async function gUser(request, reply, fastify, getUserInfo) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const userInfo = getUserInfo.get(userId);
		return reply.code(200).send({
			username: userInfo.username,
			displayName: userInfo.displayName,
			pong: {
				wins: userInfo.pongWins,
				losses: userInfo.pongLosses
			},
			tetris: {
				wins: userInfo.tetrisWins,
				losses: userInfo.tetrisLosses
			}
		});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
