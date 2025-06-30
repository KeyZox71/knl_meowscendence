import fastifyJWT from '@fastify/jwt';
import sqlite from 'node:sqlite';
import bcrypt from 'bcrypt';
const database = new sqlite.DatabaseSync(':memory:');
const saltRounds = 10;

/**
 *	@description	Can be used to prepare the database
 */
function prepareDB() {
	database.exec(`
		CREATE TABLE credentials (
			username TEXT PRIMARY KEY,
			passwordHash TEXT
		) STRICT
	`);
}

prepareDB()

const userCheck = database.prepare('SELECT EXISTS (SELECT 1 FROM credentials WHERE username = ?);');
const userQuery = database.prepare('SELECT username, passwordHash FROM credentials WHERE username = ?;');
const userAdd = database.prepare('INSERT INTO credentials (username, passwordHash) VALUES (?, ?)');

/**
 *	@description	Can be used to check is a user exists in the database
 *	@param {string} name
 *
 *	@returns {boolean}
 */
function checkUser(name) {
	const result = userCheck.get(name);
	const key = Object.keys(result)[0];

	return result[key] === 1;
}

function isValidString(value) {
	return typeof value === 'string' && value.trim() !== '';
}

/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {
	fastify.register(fastifyJWT, {
		secret: '12345',
		cookie: {
			cookieName: 'refreshToken'
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
		/** @type {{ user: string, password: string }} */
		const { user, password } = request.body;
	});

	fastify.post('/register', async (request, reply) => {
		try {
			/** @type {{ username: string, password: string }} */
			const { username, password } = request.body;

			if (!isValidString(username) || !isValidString(password)) {
				return reply.code(400).send({ error: 'Invalid username or password' });
			} else if (checkUser(username) === true) {
				return reply.code(400).send({ error: "User already exist" });
			} else if (password.length <= 8) {
				return reply.code(400).send({ error: "Password too short" });
			} else if (password.length > 64) {
				return reply.code(400).send({ error: "Password too long" });
			}

			const hash = await bcrypt.hash(password, saltRounds);
			userAdd.run(username, hash);
			return reply.code(200).send({ msg: 'Register successfuly' });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send();
		}
	});

	fastify.get('/check', { preHandler: [fastify.authenticate] }, async (request) => {
		return reply.code(200).send();
	});
}
