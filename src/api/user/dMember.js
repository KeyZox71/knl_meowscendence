export async function dMember(request, reply, fastify, getUserInfo, changeDisplayName) {
	try {
		if (!request.user) {
			return reply.code(400).send({ error: "Please specify a user" });
		}
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const user = request.user;
		const member = request.params.member;
		if (user === 'admin' || user === request.params.userId) {
			if (member === 'displayName') {
				changeDisplayName.run("", request.params.userId);
				return reply.code(200).send({ msg: "Display name deleted successfully" });
			}
			return reply.code(400).send({ msg: "Member does not exist" })
		} else {
			return reply.code(401).send({ error: 'You dont have the right to delete this' });
		}
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
