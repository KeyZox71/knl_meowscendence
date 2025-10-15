async function fetchSave(request, reply, userId, addMatch) {
	const res = await fetch('http://localhost:3003/', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p1: userId, p2: request.body.opponent, p1Score: request.body.myScore, p2Score: request.body.opponentScore }) });
	if (!res.ok) {
		throw new Error('Internal server error');
	}
	const data = await res.json();
	addMatch.run(userId, data.id);
}

export async function pMatchHistory(request, reply, fastify, getUserInfo, addMatch, incWins, incLosses) {
	try {
		const userId = request.params.userId;
		if (!request.user) {
			return reply.code(400).send({ error: "Please specify a user" });
		}
		if (request.user !== 'admin' && request.user !== userId) {
			return reply.code(401).send({ error: "Unauthorized" });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		if (!getUserInfo.get(request.body.opponent)) {
			return reply.code(404).send({ error: "Opponent does not exist" });
		}
		if (request.body.opponent === userId) {
			return reply.code(400).send({ error: "Do you have dementia ? You cannot have played a match against yourself gramps" });
		}
		await fetchSave(request, reply, userId, addMatch);
		if (request.body.myScore > request.body.opponentScore) {
			incWins.run(userId);
			incLosses.run(request.body.opponent);
		} else if (request.body.myScore < request.body.opponentScore) {
			incWins.run(request.body.opponent);
			incLosses.run(userId);
		}
		return reply.code(200).send({ msg: "Match successfully saved to the blockchain" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
