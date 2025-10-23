export async function dMatchHistory(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteStatsPong, deleteStatsTetris) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const { game } = request.query;
		if (game !== 'pong' && game !== 'tetris') {
			return reply.code(400).send({ error: "Specified game does not exist" });
		}
		deleteMatchHistory.run(game, userId);
		if (game === 'pong') {
			deleteStatsPong.run(userId);
		}
		else if (game === 'tetris') {
			deleteStatsTetris.run(userId);
		}
		return reply.code(200).send({ msg: "Match history deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
