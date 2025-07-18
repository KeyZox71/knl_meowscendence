import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

import { register } from './register.js';
import { login } from './login.js';
import { gRedir } from './gRedir.js';
import authDB from '../../utils/authDB.js'
import { gLogCallback } from './gLogCallback.js';
import { gRegisterCallback } from './gRegisterCallback.js';

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
	fastify.get('/login/google', async (request, reply) => {
		return gRedir(request, reply, fastify, '/login/google/callback');
	});
	fastify.get('/register/google', async (request, reply) => {
		return gRedir(request, reply, fastify, '/register/google/callback');
	});
	fastify.get('/login/google/callback', async (request, reply) => {
		return gLogCallback(request, reply, fastify);
	})
	fastify.get('/register/google/callback', async (request, reply) => {
		return gRegisterCallback(request, reply, fastify);
	})

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
