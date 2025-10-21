export async function gAvatar(request, reply, fastify, getUserInfo, getAvatarId) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.code(404).send({ error: "User does not exist" });
		}
		const imageId = 1;//getAvatarId.get(userId);
		if (imageId === -1) {
			;// return random kanel image
		}
		const res = await fetch(`http://localhost:3004/images/${imageId}`, { method: "GET" });
		if (!res.ok) {
			console.log("====================================\nAn error on the image API has occured");
			return reply.code(500).send({ error: "Internal server error" });
		}
		for (const [key, value] of res.headers) {
			reply.header(key, value);
		}
		if (res.body) {
			reply.code(res.statusCode).send(res.body);
		} else {
			reply.code(res.statusCode).send();
		}
		//return reply.code(200).type(res.header).send(res.body);
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
