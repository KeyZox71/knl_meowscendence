import Fastify from 'fastify';
import authApi from './api/auth/default.js';
import userApi from './api/user/default.js';
import scoreApi from './api/scoreStore/default.js';

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

function sigHandle(signal) {
	process.exit(0);
}

process.on('SIGINT', sigHandle);

async function start() {
	const target = process.env.API_TARGET || 'all';

	if (target === 'auth' || target === 'all') {
		const auth = Fastify({ logger: loggerOption });
		auth.register(authApi);
		if (target !== 'all') {
			await auth.listen({ port: 3000, host: '0.0.0.0' });
			console.log('Auth API listening on http://0.0.0.0:3000');
		}
		else {
			await auth.listen({ port: 3001, host: '127.0.0.1'});
			console.log('Auth API listening on http://localhost:3001');
		}
	}

	if (target === 'user' || target === 'all') {
		const user = Fastify({ logger: loggerOption });
		user.register(userApi);
		if (target !== 'all') {
			await user.listen({ port: 3000, host: '0.0.0.0' });
			console.log('User API listening on http://0.0.0.0:3000');
		}
		else {
			await user.listen({ port: 3002, host: '127.0.0.1'});
			console.log('User API listening on http://localhost:3002');
		}
	}

	if (target === 'scoreStore' || target === 'all') {
		const scoreStore = Fastify({ logger: loggerOption });
		scoreStore.register(scoreApi);
		if (target !== 'all') {
			await scoreStore.listen({ port: 3000, host: '0.0.0.0' });
			console.log('scoreStore API listening on http://0.0.0.0:3000');
		}
		else {
			await scoreStore.listen({ port: 3002, host: '127.0.0.1'});
			console.log('scoreStore API listening on http://localhost:3002');
		}
	}
}

start().catch(console.error);
