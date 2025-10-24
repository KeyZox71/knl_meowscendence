export async function pFriend(request, reply, fastify, getUserInfo, getFriend, addFriend) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const friendId = request.params.friendId;
		if (!getUserInfo.get(friendId)) {
			return reply.code(404).send({ error: "Friend does not exist" });
		}
		if (friendId === userId) {
			return reply.code(400).send({ error: "You can't add yourself :D" });
		}
		if (getFriend.get(userId, friendId)) {
			return reply.code(400).send({ error: "Friend already added" });
		}
		addFriend.run(userId, friendId)
		return reply.code(200).send({ msg: "Friend added successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
