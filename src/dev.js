import Fastify from 'fastify';
import authApi from './api/auth/default.js';
import userApi from './api/user/default.js';

const loggerOption = {
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			translateTime: 'HH:MM:ss',
			ignore: 'pid,hostname'
		}
	}
};

async function start() {
	const auth = Fastify({
		logger: loggerOption
	});
	auth.register(authApi);
	await auth.listen({ port: 3001 });
	console.log('Auth API listening on http://localhost:3001');

	const user = Fastify({
		logger: loggerOption
	});
	user.register(userApi);
	await user.listen({ port: 3002 });
	console.log('User data API listening on http://localhost:3002');
}

start().catch(console.error);
