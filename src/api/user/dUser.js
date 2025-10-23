export async function dUser(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteFriends, deleteUser) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		deleteMatchHistory.run('pong', request.params.userId);
		deleteMatchHistory.run('tetris', request.params.userId);
		deleteFriends.run(request.params.userId);
		deleteUser.run(request.params.userId);
		return reply.code(200).send({ msg: "User deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
