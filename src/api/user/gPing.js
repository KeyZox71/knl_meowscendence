/**
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function gPing(request, reply, fastify, getActivityTime) {
    try {
        const user = request.params.userId;
        const time = getActivityTime.get(user);

        if (!time || !time.time) {
            return reply.code(404).send({ error: "User not found or no activity time recorded" });
        }

        const lastSeenTime = new Date(time.time);
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000); // 60,000 ms = 1 minute

        const isActiveInLastMinute = lastSeenTime >= oneMinuteAgo;

        return reply.code(200).send({
            isLogged: isActiveInLastMinute
        });
    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Internal server error" });
    }
}
