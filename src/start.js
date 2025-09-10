import Fastify from 'fastify';
import authApi from './api/auth/default.js';
import userApi from './api/user/default.js';
import scoreApi from './api/scoreStore/default.js';
import fs from 'fs';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const logFilePath = process.env.LOG_FILE_PATH || './logs/api.log';

const loggerOption = () => {
  if (!isProduction) {
    return {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    };
  } else {
    // Make sure the directory exists
    const logDir = path.dirname(logFilePath);
    fs.mkdirSync(logDir, { recursive: true });

    const logStream = fs.createWriteStream(logFilePath, { flags: 'a' }); // append mode
    return {
      level: 'info',
      stream: logStream,
    };
  }
};

async function start() {
	const target = process.env.API_TARGET || 'all';

	const servers = [];

	if (target === 'auth' || target === 'all') {
		const auth = Fastify({ logger: loggerOption('auth') });
		auth.register(authApi);
		const port = target === 'all' ? 3001 : 3000;
		const host = target === 'all' ? '127.0.0.1' : '0.0.0.0';
		await auth.listen({ port, host });
		console.log(`Auth API listening on http://${host}:${port}`);
		servers.push(auth);
	}

	if (target === 'user' || target === 'all') {
		const user = Fastify({ logger: loggerOption('user') });
		user.register(userApi);
		const port = target === 'all' ? 3002 : 3000;
		const host = target === 'all' ? '127.0.0.1' : '0.0.0.0';
		await user.listen({ port, host });
		console.log(`User API listening on http://${host}:${port}`);
		servers.push(user);
	}
  
	if (target === 'scoreStore' || target === 'all') {
		const score = Fastify({ logger: loggerOption('scoreStore') });
		score.register(scoreApi);
		const port = target === 'all' ? 3002 : 3000;
		const host = target === 'all' ? '127.0.0.1' : '0.0.0.0';
		await score.listen({ port, host });
		console.log(`ScoreStore API listening on http://${host}:${port}`);
		servers.push(score);
	}

	// Graceful shutdown on SIGINT
	process.on('SIGINT', async () => {
		console.log('SIGINT received, closing servers...');
		await Promise.all(servers.map((srv) => srv.close()));
		process.exit(0);
	});
}

start().catch((err) => {
	console.error(err);
	process.exit(1);
});
