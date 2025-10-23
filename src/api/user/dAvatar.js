export async function dAvatar(request, reply, fastify, getUserInfo, getAvatarId, deleteAvatarId, deleteImage) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		if (!getUserInfo.get(userId)) {
			return reply.cose(404).send({ error: "User does not exist" });
		}
		const imageId = getAvatarId.get(userId);
		if (imageId.avatarId === -1) {
			return reply.code(404).send({ error: "User does not have an avatar" });
		}
		deleteImage.run(imageId.avatarId);
		deleteAvatarId.run(userId);
		return reply.code(200).send({ msg: "Avatar deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
