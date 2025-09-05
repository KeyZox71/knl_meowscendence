import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';
import fs from 'fs';

const env = process.env.NODE_ENV || 'development';

if (!env || env === 'development') {
	const database = new Database(":memory:", { verbose: console.log });
} else {
	const dbPath = process.env.DB_PATH || '/db/db.sqlite'
	const database = new Database(dbPath);
}

function prepareDB() {
	database.exec(`
		CREATE TABLE IF NOT EXISTS userData (
			username TEXT PRIMARY KEY,
			displayName TEXT,
			avatar BLOB,
			wins INTEGER,
			losses INTEGER
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS friends (
			username TEXT,
			friendName TEXT,
			UNIQUE(username, friendName),
			CHECK(username != friendName)
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS matchHistory (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT,
			matchId INTEGER
		) STRICT
	`);
}

prepareDB();

// POST
const createUser = database.prepare('INSERT INTO userData (username, displayName, avatar, wins, losses) VALUES (?, ?, ?, 0, 0);');
const addFriend = database.prepare('INSERT INTO friends (username, friendName) VALUES (?, ?);');
const addMatch = database.prepare('INSERT INTO matchHistory (username, matchId) VALUES (?, ?);');

// PATCH
const changeDisplayName = database.prepare('UPDATE userData SET displayName = ? WHERE username = ?;');
const changeAvatar = database.prepare('UPDATE userData SET avatar = ? WHERE username = ?;');

// GET
const getUserData = database.prepare('SELECT * FROM userData;');
const getUserInfo = database.prepare('SELECT * FROM userData WHERE username = ?;');
const getFriends = database.prepare('SELECT friendName FROM friends WHERE username = ?;');
const getMatchHistory = database.prepare('SELECT matchId FROM matchHistory WHERE username = ? AND id BETWEEN ? AND ? ORDER BY id ASC;');

// DELETE
const deleteUser = database.prepare('DELETE FROM userData WHERE username = ?;');
const deleteFriend = database.prepare('DELETE FROM friends WHERE username = ? AND friendName = ?;');
const deleteFriends = database.prepare('DELETE FROM friends WHERE username = ?;');
const deleteMatchHistory = database.prepare('DELETE FROM matchHistory WHERE username = ?;');

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
	fastify.get('/users/:userId/matchHistory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (userId == request.user || request.user == 'admin') {
				if (!matchHistory) {
					return reply.code(404).send({ error: "User has not participated in any matches yet" });
				}
				if (!request.body || !request.body.i_start || !request.body.i_end) {
					return reply.code(400).send({ error: "Please specify both a strting and an ending index" });
				}
				if (request.body.i_end < request.body.i_start) {
					return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
				}
				const matchHistoryId = getMatchHistory.all(userId, request.body.i_start, request.body.i_end - 1);
				const promises = matchHistoryId.map(async (id) => {
					const res = await fetch('/' + userId, { method: "GET", headers: { "Content-Type": "application/json" } });
					if (!res.ok)
						throw new Error('Failed to fetch item ${id}');
					return res.json();
				});
				const matchHistory = await Promise.all(promises);
				return reply.code(200).send({ matchHistory });
			}
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	);

	// POST
	fastify.post('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (request.user != 'admin') {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (getUserInfo.get(userId)) {
				return reply.code(400).send({ error: "User already exist" });
			}
			if (!request.body || !request.body.displayName) {
				return reply.code(400).send({ error: "Please specify a display name and an avatar" });
			}
			const avatar;
			if (request.body.avatar) {
				avatar = request.body.avatar;
			} else {
				avatar = 1;// randomly chosen avatar
			}
			createUser.run(userId, request.body.displayName, avatar);
			return reply.code(200).send({ msg: "User created sucessfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
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
	fastify.post('/users/:userId/matchHistory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (request.user != 'admin' && request.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (!request.body || !request.body.user || !request.body.p1Score || !request.body.p2Score) {
				return reply.code(400).send({ error: "Please specify the second player and the score of both players" });
			}
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (!getUserInfo.get(request.body.user)) {
				return reply.code(404).send({ error: "Second player does not exist" });
			}
			if (request.body.user === userId) {
				return reply.code(400).send({ error: "Do you have dementia ? You cannot have played a match against yourself, gramps" });
			}
			if (request.body.p1Score < 0 || request.body.p2Score < 0) {
				return reply.code(400).send({ error: "A score cannot be strictly negative" });
			}
			const res = await fetch('/', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p1: userId, p2: request.body.user, p1Score: request.body.p1Score, p2Score: request.body.p2Score }) });
			if (!res.ok)
				return reply.code(500).send({ error: "Internal server error" });
			addMatch.run(userId, res.id);
			return reply.code(200).send({ msg: "Match history retrieved successfully" });
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
				return reply.code(200).send({ msg: "Display name modified sucessfully" });
			}
			if (member === 'avatar') {
				if (!request.body || !request.body.avatar) {
					return reply.code(400).send({ error: "Please specify an avatar" });
				}
				changeAvatar.run(request.body.avatar, userId);
				return reply.code(200).send({ msg: "Avatar modified sucessfully" });
			}
			return reply.code(400).send({ error: "Avatar does not exist" })
			}
			return reply.code(400).send({ error: "Member does not exist" })
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

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
					return reply.code(200).send({ msg: "Display name cleared sucessfully" });
				}
				return reply.code(400).send({ msg: "Member does not exist" })
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
