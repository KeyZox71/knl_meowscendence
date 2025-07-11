import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

const database = new Database(":memory:");
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
const passwordQuery = database.prepare('SELECT passwordHash FROM credentials WHERE username = ?;');
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
		secret: '123456789101112131415161718192021',
		cookie: {
			cookieName: 'token',
		},
		sign: {
			expiresIn: '100000m'
		}
	});
	fastify.register(fastifyCookie);

	fastify.post('/login', async (request, reply) => {
		try {
			/** @type {{ user: string, password: string }} */
			const { user, password } = request.body;

			if (!checkUser(user) || user === 'admin') {
				return reply.code(400).send({ error: "User does not exist" });
			}

			const query = passwordQuery.get(user);
			const hash = query?.passwordHash;

			if (!hash) {
				return reply.code(500).send({ error: "No password was found" });
			}

			const compare = await bcrypt.compare(password, hash);

			if (!compare) {
				return reply.code(401).send({ error: "Incorrect password" });
			}

			const token = fastify.jwt.sign({ user });

			return reply
				.setCookie('token', token, {
					httpOnly: true,
					path: '/',
					secure: false,
					sameSite: 'lax',
				})
				.code(200)
				.send({ msg: "Login successful" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	fastify.post('/register', async (request, reply) => {
		try {
			/** @type {{ user: string, password: string }} */
			const { user, password } = request.body;

			if (!isValidString(user) || !isValidString(password) || user === 'admin') {
				return reply.code(400).send({ error: 'Invalid username or password' });
			} else if (checkUser(user) === true) {
				return reply.code(400).send({ error: "User already exist" });
			} else if (password.length <= 8) {
				return reply.code(400).send({ error: "Password too short" });
			} else if (password.length > 64) {
				return reply.code(400).send({ error: "Password too long" });
			}

			const hash = await bcrypt.hash(password, saltRounds);
			userAdd.run(user, hash);
			return reply.code(200).send({ msg: 'Register successfuly' });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
}
