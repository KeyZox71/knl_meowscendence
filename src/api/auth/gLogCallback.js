import axios from 'axios'
import authDB from '../../utils/authDB.js';

var env = process.env.NODE_ENV || 'development';

/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function gLogCallback(request, reply, fastify) {
	const { code } = request.query;

	try {
		const response = await axios.post('https://oauth2.googleapis.com/token', {
			code,
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uri: process.env.GOOGLE_CALLBACK_URL + '/login/google/callback',
			grant_type: 'authorization_code',
		});

		const { access_token } = response.data;

		const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${access_token}` },
		});

		const userProfile = userInfoResponse.data;
		const user = {
			username: userProfile.email, // Assuming email is used as the username
		};

		if (!authDB.checkUser(user.username) || authDB.RESERVED_USERNAMES.includes(user.username)) {
			return reply.code(400).send({ error: "User does not exist" });
		}

		const token = fastify.jwt.sign(user);

		return reply
			.setCookie('token', token, {
				httpOnly: true,
				path: '/',
				secure: env !== 'development',
				sameSite: 'lax',
			})
			.code(200)
			.send({ msg: "Login successful" });
	} catch (error) {
		fastify.log.error(error);
		reply.code(500).send({ error: 'Internal server error' });
	}
}
