import axios from 'axios'

import authDB from '../../utils/authDB.js';
import { authUserCreate } from '../../utils/authUserCreate.js';

var env = process.env.NODE_ENV || 'development';

/**
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 *
 *	@returns {import('fastify').FastifyReply}
 */
export async function gRegisterCallback(request, reply, fastify) {
	const { code } = request.query;

	try {
		const response = await axios.post('https://oauth2.googleapis.com/token', {
			code,
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_secret: process.env.GOOGLE_CLIENT_SECRET,
			redirect_uri: process.env.GOOGLE_CALLBACK_URL + '/register/google/callback',
			grant_type: 'authorization_code',
		}, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		const { access_token } = response.data;

		const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${access_token}` },
		});
		const userProfile = userInfoResponse.data;
		const user = {
			username: userProfile.email, // Assuming email is used as the username
		};

		if (authDB.RESERVED_USERNAMES.includes(user)) {
			return reply.code(400).send({ error: 'Reserved username' });
		}
		if (authDB.checkUser(user.username) === true) {
			return reply.code(400).send({ error: "User already exist" });
		}

		authDB.addUser(user.username, '');

		authUserCreate(user.username, fastify)

		const token = fastify.jwt.sign({ user: user.username});

		return reply
			.setCookie('token', token, {
				httpOnly: true,
				path: '/',
				secure: env !== 'development',
				sameSite: 'lax',
			}).redirect(process.env.CALLBACK_REDIR);
	} catch (error) {
		fastify.log.error(error);
		reply.code(500).send({ error: 'Internal server error' });
	}
}
