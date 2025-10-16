import axios from 'axios'

/**
 * @param {string} username
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function authUserRemove(username, fastify) {
	const url = ((process.env.USER_URL + "/") || "http://localhost:3002/") + "users/" + username;
	const cookie = fastify.jwt.sign({ user: "admin" });

	await axios.post(
		url,
		{
			headers: {
				'Cookie': 'token=' + cookie,
			},
		}
	);
}
