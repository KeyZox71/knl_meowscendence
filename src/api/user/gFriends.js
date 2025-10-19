export async function gFriends(request, reply, fastify, getUserInfo, getFriends) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const { iStart, iEnd } = request.query;
		if (Number(iEnd) < Number(iStart)) {
			return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
		}
		const friendNames = getFriends.all(userId, Number(iEnd) - Number(iStart), Number(iStart));
		if (!friendNames.length) {
			return reply.code(404).send({ error: "No friends exist in the selected range" });
		}
		const promises = friendNames.map(async (friendName) => {
			const friend = getUserInfo.get(friendName.friendName);
			friendName.friendDisplayName = friend.displayName;
			return friendName;
		});
		const friends = await Promise.all(promises);
		return reply.code(200).send({ friends });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
