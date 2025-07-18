import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

import { register } from './register.js';
import { login } from './login.js';
import authDB from '../../utils/authDB.js'

const saltRounds = 10;

authDB.prepareDB();

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {
	fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET || '123456789101112131415161718192021',
		cookie: {
			cookieName: 'token',
		},
		sign: {
			expiresIn: '100000m'
		}
	});
	fastify.register(fastifyCookie);

	fastify.get('/me', async (request, reply) => {
		try {
			const token = request.cookies.token;
			const decoded = await fastify.jwt.verify(token);
			return { user: decoded.user };
		} catch {
			return reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	// GOOGLE sign in
	

	fastify.post('/login', {
		schema: {
			body: {
				type: 'object',
				required: ['user', 'password'],
				properties: {
					user: { type: 'string', minLength: 1 },
					password: { type: 'string', minLength: 8 }
				}
			}
		}
	}, async (request, reply) => { return login(request, reply, fastify); });

	fastify.post('/register', {
		schema: {
			body: {
				type: 'object',
				required: ['user', 'password'],
				properties: {
					user: { type: 'string', minLength: 1 },
					password: { type: 'string', minLength: 8 }
				}
			}
		}
	}, async (request, reply) => { return register(request, reply, saltRounds, fastify); });
}
