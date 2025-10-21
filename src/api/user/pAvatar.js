export async function pAvatar(request, reply, fastify, getUserInfo, setAvatarId) {
	try {
		const userId = request.params.userId;
		if (!getUserInfo.get(userId)) {
			return reply.cose(404).send({ error: "User does not exist" });
		}
		console.log("====================================\n", request.headers);//==========
		const res = await fetch('http://localhost:3004/images', { method: "POST", headers: { "Content-Type": "image/webp" }, body: request.body ? JSON.stringify(request.body) : undefined });
		if (!res.ok) {
			return reply.code(500).send({ error: "Internal server error" });
		}
		const data = await res.json();
		setAvatarId.run(data.imageId, userId);
		return reply.code(200).send({ msg: "Avatar uploaded successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
