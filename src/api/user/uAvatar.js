import sharp from 'sharp';

export async function uAvatar(request, reply, fastify, getUserInfo, setAvatarId, getAvatarId, deleteAvatarId, postImage, deleteImage) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const buffer = request.body;
		if (!buffer) {
			return reply.code(400).send({ error: "No file uploaded" });
		}
		if (buffer.length > 5 * 1024 * 1024) {
			return reply.code(400).send({ error: "File too large" });
		}
		const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();
		const mimeType = request.headers['content-type'];
		const fileName = `avatar_${userId}.webp`;
		const imageId = postImage.run(fileName, mimeType, webpBuffer);
		const oldImageId = getAvatarId.get(userId);
		if (oldImageId.avatarId !== -1) {
			deleteImage.run(oldImageId.avatarId);
			deleteAvatarId.run(userId);
		}
		setAvatarId.run(imageId.lastInsertRowid, userId);
		return reply.code(200).send({ msg: "Avatar modified successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
