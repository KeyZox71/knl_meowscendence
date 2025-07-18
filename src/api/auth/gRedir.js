/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *	@param {string} callbackRoute
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function gRedir(request, reply, fastify, callbackRoute) {
	try {
		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
			`client_id=${process.env.GOOGLE_CLIENT_ID}&` +
			`redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL + callbackRoute)}&` +
			`response_type=code&` +
			`scope=email profile&` +
			`access_type=offline`;

		return reply.redirect(authUrl);
	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
