async function fetchSave(request, reply, userId, addMatch) {
	let opponentName = '';
	let opponentScore = 0;
	if (request.body.opponent && request.body.opponentScore) {
		opponentName = request.body.opponent;
		opponentScore = request.body.opponentScore;
	}
	const res = await fetch('http://localhost:3003/', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p1: userId, p2: opponentName, p1Score: request.body.myScore, p2Score: opponentScore }) });
	if (!res.ok) {
		throw new Error('Internal server error');
	}
	const data = await res.json();
	addMatch.run(request.body.game, request.body.date, userId, opponentName, data.id);
}

export async function pMatchHistory(request, reply, fastify, getUserInfo, addMatch, incWinsPong, incLossesPong, incWinsTetris, incLossesTetris) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		if (request.body.game !== 'pong' && request.body.game !== 'tetris') {
			return reply.code(400).send({ error: "Specified game does not exist" });
		}
		if (request.body.game === 'pong' && (!request.body.opponent || !request.body.opponentScore)) {
			return reply.code(400).send({ error: "Game requires two players" });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		if (request.body.opponent) {
			if (!getUserInfo.get(request.body.opponent)) {
				return reply.code(404).send({ error: "Opponent does not exist" });
			}
			if (request.body.opponent === userId) {
				return reply.code(400).send({ error: "Do you have dementia ? You cannot have played a match against yourself gramps" });
			}
		}
		await fetchSave(request, reply, userId, addMatch);
		if (request.body.game === 'pong') {
			if (request.body.myScore > request.body.opponentScore) {
				incWinsPong.run(userId);
				incLossesPong.run(request.body.opponent);
			} else if (request.body.myScore < request.body.opponentScore) {
				incWinsPong.run(request.body.opponent);
				incLossesPong.run(userId);
			}
		}
		else if (request.body.game === 'tetris' && request.body.opponent && request.body.opponentScore) {
			if (request.body.myScore > request.body.opponentScore) {
				incWinsTetris.run(userId);
				incLossesTetris.run(request.body.opponent);
			} else if (request.body.myScore < request.body.opponentScore) {
				incWinsTetris.run(request.body.opponent);
				incLossesTetris.run(userId);
			}
		}
		return reply.code(200).send({ msg: "Match successfully saved to the blockchain" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
