import fastifyJWT from '@fastify/jwt'
import sqlite from 'node:sqlite'
const database = new sqlite.DatabaseSync(':memory:');

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {import('fastify').FastifyPluginOptions} options
 */
export default async function(fastify, options) {
	fastify.register(fastifyJWT, {
		secret: '12345',
		cookie: {
			cookieName: 'refreshToken',
		},
		sign: {
			expiresIn: '100000m'
		}
	});

	fastify.decorate("authenticate", async function(request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	fastify.post('/login', async (request, reply) => {
		// const { username, password } = request.body;
	});

	fastify.post('/register', async (request, reply) => {
		// const { username, password } = request.body;
	});

	fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request) => {
		// return { user: request.user };
	});
}
