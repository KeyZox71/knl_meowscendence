export async function gUsers(request, reply, fastify, getUserData) {
	try {
		const { iStart, iEnd } = request.query;
		if (Number(iEnd) < Number(iStart)) {
			return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
		}
		const users = getUserData.all(Number(iEnd) - Number(iStart), Number(iStart));
		if (!users.length) {
			return reply.code(404).send({ error: "No users exist in the selected range" });
		}
		const usersFormat = users.map(obj => ({
			username: obj.username,
			displayName: obj.displayName,
			pong: {
				wins: obj.pongWins,
				losses: obj.pongLosses
			},
			tetris: {
				wins: obj.tetrisWins,
				losses: obj.tetrisLosses
			}
		}));
		return reply.code(200).send({ usersFormat });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
