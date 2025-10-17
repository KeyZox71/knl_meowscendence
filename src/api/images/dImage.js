export async function dImage(request, reply, fastify, deleteImage) {
	try {
		const imageId = Number(request.params.imageId);
		deleteImage.run(imageId);
		return reply.code(200).send({ msg: "Image deleted successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
