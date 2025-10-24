import axios from 'axios';

/**
 * @param {string} username
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function authUserCreate(username, fastify) {
    const payload = {
        displayName: username,
    };
    const cookie = fastify.jwt.sign({ user: "admin" });

	const url = process.env.USER_URL || "http://localhost:3002"

    await axios.post(
        url + "/users/" + username,
        payload,
        {
            headers: {
                'Cookie': 'token=' + cookie,
            },
        }
    );
}
