import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';
import client from 'prom-client';

var env = process.env.NODE_ENV || 'development';
const collectDefaultMetrics = client.collectDefaultMetrics

let database;

if (!env || env === 'development') {
	database = new Database(":memory:", { verbose: console.log });
} else {
	var dbPath = process.env.DB_PATH || '/db/db.sqlite'
	database = new Database(dbPath);
}

function prepareDB() {
	database.exec(`
		CREATE TABLE IF NOT EXISTS userData (
			username TEXT PRIMARY KEY,
			displayName TEXT
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS friends (
			username TEXT,
			friendName TEXT,
			UNIQUE(username, friendName),
			CHECK(username != friendName)
		)
	`);
}

prepareDB();

// POST
const createUser = database.prepare('INSERT INTO userData (username, displayName) VALUES (?, ?);');
const addFriend = database.prepare('INSERT INTO friends (username, friendName) VALUES (?, ?);');

// PATCH
const changeDisplayName = database.prepare('UPDATE userData SET displayName = ? WHERE username = ?;');

// GET
const getUserInfo = database.prepare('SELECT * FROM userData WHERE username = ?;');
const getUserData = database.prepare('SELECT * FROM userData;');
const getFriends = database.prepare('SELECT friendName FROM friends WHERE username = ?;');
// const isFriend = database.prepare('SELECT 1 FROM friends WHERE username = ? AND friendName = ?;');

// DELETE
const deleteUser = database.prepare('DELETE FROM userData WHERE username = ?;');
const deleteFriend = database.prepare('DELETE FROM friends WHERE username = ? AND friendName = ?;');
const deleteFriends = database.prepare('DELETE FROM friends WHERE username = ?;');


/**
 * @param {import('fastify').FastifyInstance}		fastify
 * @param {import('fastify').FastifyPluginOptions}	options
 */
export default async function(fastify, options) {

	collectDefaultMetrics({ labels: { service: "auth-api" } })
	client.register.setDefaultLabels({ service: "auth-api" })

	const httpRequestCounter = new client.Counter({
		name: 'http_requests_total',
		help: 'Total number of HTTP requests',
		labelNames: ['method', 'route', 'status_code'],
	})

	fastify.addHook('onResponse', (req, res, done) => {
		httpRequestCounter.inc({
			method: req.method,
			route: req.routerPath || req.url,
			status_code: res.statusCode,
		})
		done()
	})
	fastify.get('/metrics', async (req, reply) => {
		reply
			.header('Content-Type', client.register.contentType)
			.send(await client.register.metrics())
	})


	fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET || '123456789101112131415161718192021',
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
		try {
			const users = getUserData.all();

			return reply.code(200).send({ users });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const info = getUserInfo.get(request.params.userId);

			return reply.code(200).send({ info });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/:userId/friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;

			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}

			if (userId == request.user || request.user == 'admin') {
				const friends = getFriends.all(userId);

				if (!friends) {
					return reply.code(404).send({ error: "User does not have friends D:" });
				}
				return reply.code(200).send({ friends });
			}
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	// POST
	fastify.post('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		try {
			const userId = request.params.userId;

			if (getUserInfo.get(userId)) {
				return reply.code(400).send({ error: "User already exist" });
			}
			createUser.run(userId, userId);
			return reply.code(200).send({ msg: "User created sucessfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	})
	fastify.post('/users/:userId/friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (request.user != 'admin' && request.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (!request.body || !request.body.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (!getUserInfo.get(request.body.user)) {
				return reply.code(404).send({ error: "Friend does not exist" });
			}
			if (request.body.user === userId) {
				return reply.code(400).send({ error: "You can't add yourself :D" });
			}
			addFriend.run(userId, request.body.user)
			return reply.code(200).send({ msg: "Friend added sucessfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	// PATCH
	fastify.patch('/users/:userId/:member', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (request.user != 'admin' && request.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const member = request.params.member;

			if (member === 'displayName') {
				if (!request.body || !request.body.displayName) {
					return reply.code(400).send({ error: "Please specify a displayName" });
				}

				changeDisplayName.run(request.body.displayName, userId);
				return reply.code(200).send({ msg: "displayName modified sucessfully" });
			}
			return reply.code(400).send({ error: "Member does not exist" })
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	})

	// DELETE
	/**
	 *	@description	Can be used to delete a user from the db
	 */
	fastify.delete('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		try {
			if (!getUserInfo(request.params.userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			deleteUser.run(request.params.userId);
			deleteFriends.run(request.params.userId);
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.delete('/users/:userId/:member', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			const user = request.user;
			const member = request.params.member;
			if (user == 'admin' || user == request.params.userId) {
				if (member == 'displayName') {
					changeDisplayName.run("", request.params.userId);
					return reply.code(200).send({ msg: "displayName cleared sucessfully" });
				}
				return reply.code(400).send({ msg: "member does not exist" })
			} else {
				return reply.code(401).send({ error: 'You dont have the right to delete this' });
			}
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}

	});
	fastify.delete('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			const friendId = request.params.friendId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (request.user != 'admin' && request.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			deleteFriend.run(userId, friendId);
			return reply.code(200).send({ msg: "Friend remove sucessfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
}
