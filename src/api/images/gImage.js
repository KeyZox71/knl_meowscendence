export async function gImage(request, reply, fastify, getImage) {
	try {
		const imageId = Number(request.params.imageId);
		const image = getImage.get(imageId);
		if (!image) {
			return reply.code(404).send({ error: "Image does not exist" });
		}
		return reply.code(200).type(image.mimeType).header('Content-Disposition', `inline; filename="${image.fileName}"`).send(image.data);
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
