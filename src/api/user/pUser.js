export async function pUser(request, reply, fastify, getUserInfo, createUser) {
	try {
		const userId = request.params.userId;
		if (request.user !== 'admin') {
			return reply.code(401).send({ error: "Unauthorized" });
		}
		if (getUserInfo.get(userId)) {
			return reply.code(400).send({ error: "User already exist" });
		}
		if (!request.body || !request.body.displayName) {
			return reply.code(400).send({ error: "Please specify a display name" });
		}
		createUser.run(userId, request.body.displayName);
		return reply.code(200).send({ msg: "User created successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
