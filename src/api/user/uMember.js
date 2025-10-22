export async function uMember(request, reply, fastify, getUserInfo, changeDisplayName, changeAvatarId) {
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
		const member = request.params.member;
		if (member === 'displayName') {
			if (!request.body || !request.body.displayName) {
				return reply.code(400).send({ error: "Please specify a displayName" });
			}
			changeDisplayName.run(request.body.displayName, userId);
			return reply.code(200).send({ msg: "Display name modified successfully" });
		}
		return reply.code(400).send({ error: "Member does not exist" })
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
