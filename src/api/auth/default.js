import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors'

import { register } from './register.js';
import { login } from './login.js';
import { gRedir } from './gRedir.js';
import authDB from '../../utils/authDB.js'
import { gLogCallback } from './gLogCallback.js';
import { gRegisterCallback } from './gRegisterCallback.js';
import { totpSetup } from './totpSetup.js';
import { totpDelete } from './totpDelete.js';
import { totpVerify } from './totpVerify.js';

const saltRounds = 10;
export const appName = process.env.APP_NAME || 'knl_meowscendence';

authDB.prepareDB();

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {

	fastify.register(cors, {
		origin: process.ENV.CORS_ORIGIN || '*',
		credentials: true,
		methods: [ "GET", "POST", "DELETE", "OPTIONS" ]
	});

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
	fastify.decorate("authenticate", async function(request, reply) {
		try {
			const jwt = await request.jwtVerify();
			request.user = jwt.user;
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});


	fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return { user: request.user };
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
	});
	fastify.get('/register/google/callback', async (request, reply) => {
		return gRegisterCallback(request, reply, fastify);
	});

	// TOTP
	fastify.post('/2fa', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return totpSetup(request, reply, fastify);
	});
	fastify.post('/2fa/verify', {
		preHandler: [fastify.authenticate], schema: {
			body: {
				type: 'object',
				required: ['token'],
				properties: {
					token: { type: 'string', minLength: 6, maxLength: 6 }
				}
			}
		}
	}, async (request, reply) => {
		return totpVerify(request, reply, fastify);
	});
	fastify.delete('/2fa', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return totpDelete(request, reply, fastify);
	});


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
