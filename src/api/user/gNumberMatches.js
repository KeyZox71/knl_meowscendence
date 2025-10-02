export async function gNumberMatches(request, reply, fastify, getUserInfo, getNumberMatches) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const row = getNumberMatches.get(userId);
		return reply.code(200).send({ n_matches: row.n_matches });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
