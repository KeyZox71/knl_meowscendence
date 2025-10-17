export async function pImage(request, reply, fastify, postImage) {
	try {
		const parts = request.parts();
		for await (const part of parts) {
			if (part.file) {
				const chunks = [];
				for await (const chunk of part.file) {
					chunks.push(chunk);
				}
				const buffer = Buffer.concat(chunks);
				if (!part.filename || part.filename.trim() === '') {
					return reply.code(400).send({ error: "Missing filename" });
				}
				if (!part.mimetype || part.mimetype.trim() === '') {
					return reply.code(400).send({ error: "Missing mimetype" });
				}
				const ext = part.filename.toLowerCase().substring(part.filename.lastIndexOf('.'));
				if (ext !== 'webp') {
					return reply.code(400).send({ error: "Wrong file extension" });
				}
				// check size max here ?
				// convert image to webp using sharp
				//sharp(buffer, ).toFile();
				const id = postImage.run(part.filename, part.mimetype, buffer);
				return reply.code(200).send({ msg: "Image uploaded successfully", imageId: id.lastInsertRowid });
			}
		}
		return reply.code(400).send({ error: "No file uploaded" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
