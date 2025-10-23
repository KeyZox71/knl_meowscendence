export async function gAvatar(request, reply, fastify, getUserInfo, getAvatarId, getImage) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const imageId = getAvatarId.get(userId);
		if (imageId.avatarId === -1) {
			return reply.code(404).send({ error: "User does not have an avatar" });
		}
		const image = getImage.get(imageId.avatarId);
		if (!image) {
			return reply.code(404).send({ error: "Avatar does not exist" });
		}
		return reply.code(200).type(image.mimeType).send(image.data);
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
