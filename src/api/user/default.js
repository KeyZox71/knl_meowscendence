import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';

const database = new Database(":memory:");

function prepareDB() {
	database.exec(`
		CREATE TABLE userData (
			username TEXT PRIMARY KEY,
			displayName TEXT
		) STRICT
	`);
}

prepareDB();

// POST
const createUser = database.prepare('INSERT INTO userData (username, displayName) VALUES (?, ?);');

// PATCH
const changeDisplayName = database.prepare('UPDATE userData SET displayName = ? WHERE username = ?;');

// GET
const getUserInfo = database.prepare('SELECT * FROM userData WHERE username = ?;');
const getUserData = database.prepare('SELECT * FROM userData;');
const userCheck = database.prepare('SELECT EXISTS (SELECT 1 FROM userData WHERE username = ?);');

// DELETE
const deleteUser = database.prepare('DELETE FROM userData WHERE username = ?;');


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
	fastify.register(fastifyCookie);

	fastify.decorate("authenticate", async function(request, reply) {
		try {
			const jwt = await request.jwtVerify();
			request.user = jwt.user;
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	fastify.decorate("authenticateAdmin", async function(request, reply) {
		try {
			const jwt = await request.jwtVerify();
			if (jwt.user !== 'admin') {
				throw ("");
			}
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	// GET
	fastify.get('/users', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const users = getUserData.all();

		return reply.code(200).send({ users });
	});
	fastify.get('/users/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		if (userCheck.get(request.params.userId) == false) {
			return reply.code(400).send({ error: "User does not exist" });
		}
		const info = getUserInfo.get(request.params.userId);

		return reply.code(200).send({ info });
	});
	fastify.get('/check', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		if (request.user === 'admin') {
			return reply.code(200).send({ msg: "omg you are an admin" });
		}
		return reply.code(200).send({ msg: "workinggg", user: request.user });
	});

	// POST
	fastify.post('/create', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		if (!request.body || !request.body.user) {
			return reply.code(400).send({ error: "Please specify a user" });
		}
		if (userCheck.get(request.body.user) == true) {
			return reply.code(400).send({ error: "User already exist" });
		}
		createUser.run(request.body.user, request.body.user);
		return reply.code(200).send({ msg: "User created sucessfully" });
	})

	// DELETE
	/**
	 *	@description	Can be used to delete a user from the db
	 */
	fastify.delete('/users/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		const user = request.user;
		if (user == 'admin' || user == request.params.userId) {
			deleteUser.run(request.params.userId);
		} else {
			return reply.code(401).send({ error: 'You dont have the right to delete this user' });
		}
	});
	// fastify.delete('/users/:userId/:member', { preHandler: fastify.authenticate}, async (request, reply) => {
	// 	const user = request.user;
	// 	if (user == 'admin' || user == request.params.userId) {
	// 		deleteUser.run(request.params.userId);
	// 	} else {
	// 		return reply.code(401).send({ error: 'You dont have the right to delete this'});
	// 	}
	//
	// });

}
