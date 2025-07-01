import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';

const database = new Database(":memory:");

function prepareDB() {
	database.exec(`
		CREATE TABLE credentials (
			username TEXT PRIMARY KEY,
			passwordHash TEXT
		) STRICT
	`);
}

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {
	fastify.register(fastifyJWT, {
		secret: '123456789101112131415161718192021',
		cookie: {
			cookieName: 'token',
		},
	});

	fastify.decorate("authenticate", async function(request, reply) {
		try {
			// fastify.log.info(request.headers.cookie);
			const jwt = await request.jwtVerify();
			request.user = jwt.user;
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	fastify.register(fastifyCookie);

	fastify.get('/check', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return reply.code(200).send({ msg: "workinggg", user: request.user });
	});
}
