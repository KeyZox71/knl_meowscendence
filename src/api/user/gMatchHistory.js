export async function gMatchHistory(request, reply, fastify, getUserInfo, getMatchHistory) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const { game, iStart, iEnd } = request.query;
		if (game !== 'pong' && game !== 'tetris') {
			return reply.code(400).send({ error: "Specified game does not exist" });
		}
		if (Number(iEnd) < Number(iStart)) {
			return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
		}
		const matchHistoryId = getMatchHistory.all(game, userId, Number(iEnd) - Number(iStart), Number(iStart));
		if (!matchHistoryId.length) {
			return reply.code(404).send({ error: "No matches exist in the selected range" });
		}
		const promises = matchHistoryId.map(async (match) => {
			const res = await fetch(`http://localhost:3003/${match.matchId}`, { method: "GET" });
			if (!res.ok) {
				throw new Error('Failed to fetch item from blockchain API');
			}
			const resJson = await res.json();
			resJson.score.date = match.date;
			return resJson;
		});
		const matchHistory = await Promise.all(promises);
		return reply.code(200).send({ matchHistory });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
