export async function dUser(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteFriends, deleteUser) {
	try {
		if (request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		deleteMatchHistory.run('pong', userId);
		deleteMatchHistory.run('tetris', userId);
		deleteFriends.run(userId);
		deleteUser.run(userId);
		return reply.code(200).send({ msg: "User deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
