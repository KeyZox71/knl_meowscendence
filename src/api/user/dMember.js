export async function dMember(request, reply, fastify, getUserInfo, changeDisplayName) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const user = request.user;
		const member = request.params.member;
		if (member === 'displayName') {
			changeDisplayName.run("", request.params.userId);
			return reply.code(200).send({ msg: "Display name deleted successfully" });
		} else {
			return reply.code(400).send({ msg: "Member does not exist" })
		}
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
