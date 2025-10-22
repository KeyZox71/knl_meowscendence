export async function gNumberUsers(request, reply, fastify, getNumberUsers) {
	try {
		const row = getNumberUsers.get();
		return reply.code(200).send({ n_users: row.n_users });
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
