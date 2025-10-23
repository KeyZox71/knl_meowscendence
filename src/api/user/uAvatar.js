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
		deleteAvatarId.run(userId);
		const parts = request.parts();
		for await (const part of parts) {
			if (part.file) {
				let size = 0;
				const chunks = [];
				for await (const chunk of part.file) {
					size += chunk.length;
					chunks.push(chunk);
				}
				if (size === 5 * 1024 * 1024 + 1) {
					return reply.code(400).send({ error: "File too large" });
				}
				const buffer = Buffer.concat(chunks);
				if (!part.filename || part.filename.trim() === '') {
					return reply.code(400).send({ error: "Missing filename" });
				}
				if (!part.mimetype || part.mimetype.trim() === '') {
					return reply.code(400).send({ error: "Missing mimetype" });
				}
				const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();
				const imageId = postImage.run(part.filename, part.mimetype, webpBuffer);
				const oldImageId = getAvatarId.get(userId);
				if (oldImageId.avatarId !== -1) {
					deleteImage.run(oldImageId.avatarId);
					deleteAvatarId.run(userId);
				}
				setAvatarId.run(imageId.lastInsertRowid, userId);
				return reply.code(200).send({ msg: "Avatar modified successfully" });
			}
		}
		return reply.code(400).send({ error: "No avatar modified" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
