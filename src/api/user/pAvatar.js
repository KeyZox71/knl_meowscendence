import sharp from 'sharp';

/**
 *	@param {import('fastify').FastifyRequest} request
 *	@param {import('fastify').FastifyReply} reply
 *	@param {import('fastify').FastifyInstance} fastify
 */
export async function pAvatar(request, reply, fastify, getUserInfo, getAvatarId, setAvatarId, deleteAvatarId, postImage, deleteImage) {
	try {
		const userId = request.params.userId;
		if (request.user !== userId && request.user !== 'admin') {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}

		// Read the raw body as a Buffer
		const buffer = request.body;

		if (!buffer) {
			return reply.code(400).send({ error: "No file uploaded" });
		}

		// Check file size (5MB limit)
		if (buffer.length > 5 * 1024 * 1024) {
			return reply.code(400).send({ error: "File too large" });
		}

		// Convert to WebP
		const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();

		// Save the image and update the user's avatar
		const mimeType = request.headers['content-type'];
		const fileName = `avatar_${userId}.webp`;
		const imageId = postImage.run(fileName, mimeType, webpBuffer);

		const oldImageId = getAvatarId.get(userId);
		if (oldImageId.avatarId !== -1) {
			deleteImage.run(oldImageId.avatarId);
			deleteAvatarId.run(userId);
		}

		setAvatarId.run(imageId.lastInsertRowid, userId);

		return reply.code(200).send({ msg: "Avatar uploaded successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
