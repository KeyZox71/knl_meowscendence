export async function pAvatar(request, reply, fastify, setAvatarId) {
	try {
/*		const res = await fetch('http://localhost:3004/images', { method: "POST", headers: {  } });
		if (!res.ok) {
			return reply.code(500).send({ error: "Internal server error" });
		}
		const data = await res.json();*/
		return reply.code(200).send({ msg: "Avatar uploaded successfully" });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
