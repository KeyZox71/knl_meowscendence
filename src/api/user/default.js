import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';

const env = process.env.NODE_ENV || 'development';

let database;
if (!env || env === 'development') {
	database = new Database(':memory:', { verbose: console.log });
} else {
	const dbPath = process.env.DB_PATH || '/db/db.sqlite'
	database = new Database(dbPath);
}

function prepareDB() {
	database.exec(`
		CREATE TABLE IF NOT EXISTS userData (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT,
			displayName TEXT,
			wins INTEGER,
			losses INTEGER,
			UNIQUE(username),
			CHECK(wins >= 0),
			CHECK(losses >= 0)
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS friends (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
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
const createUser = database.prepare('INSERT INTO userData (username, displayName, wins, losses) VALUES (?, ?, 0, 0);');
const addFriend = database.prepare('INSERT INTO friends (username, friendName) VALUES (?, ?);');
const addMatch = database.prepare('INSERT INTO matchHistory (username, matchId) VALUES (?, ?);');
const incWins = database.prepare('UPDATE userData SET wins = wins + 1 WHERE username = ?;');
const incLosses = database.prepare('UPDATE userData SET losses = losses + 1 WHERE username = ?');

// PATCH
const changeDisplayName = database.prepare('UPDATE userData SET displayName = ? WHERE username = ?;');

// GET
const getUserData = database.prepare('SELECT username, displayName, wins, losses FROM userData LIMIT ? OFFSET ?;');
const getUserInfo = database.prepare('SELECT username, displayName, wins, losses FROM userData WHERE username = ?;');
const getFriends = database.prepare('SELECT friendName FROM friends WHERE username = ? LIMIT ? OFFSET ?;');
const getFriend = database.prepare('SELECT friendName FROM friends WHERE username = ? AND friendName = ?;');
const getMatchHistory = database.prepare('SELECT matchId FROM matchHistory WHERE username = ? LIMIT ? OFFSET ?;');
const getNumberUsers = database.prepare('SELECT COUNT (DISTINCT username) AS n_users FROM userData;');
const getNumberFriends = database.prepare('SELECT COUNT (DISTINCT friendName) AS n_friends FROM friends WHERE username = ?;');
const getNumberMatches = database.prepare('SELECT COUNT (DISTINCT id) AS n_matches FROM matchHistory WHERE username = ?;')

// DELETE
const deleteUser = database.prepare('DELETE FROM userData WHERE username = ?;');
const deleteFriend = database.prepare('DELETE FROM friends WHERE username = ? AND friendName = ?;');
const deleteFriends = database.prepare('DELETE FROM friends WHERE username = ?;');
const deleteMatchHistory = database.prepare('DELETE FROM matchHistory WHERE username = ?;');
const deleteStats = database.prepare('UPDATE userData SET wins = 0, losses = 0 WHERE username = ?;');

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

	fastify.decorate('authenticate', async function(request, reply) {
		try {
			const jwt = await request.jwtVerify();
			request.user = jwt.user;
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	fastify.decorate('authenticateAdmin', async function(request, reply) {
		try {
			const jwt = await request.jwtVerify();
			if (jwt.user !== 'admin') {
				throw ('You lack administrator privileges');
			}
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	// GET
	fastify.get('/users', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const { iStart, iEnd } = request.query;
			if (!iStart || !iEnd) {
				return reply.code(400).send({ error: "Please specify both a starting and an ending index" });
			}
			if (Number(iEnd) < Number(iStart)) {
				return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
			}
			const users = getUserData.all(Number(iEnd) - Number(iStart), Number(iStart));
			if (!users.length) {
				return reply.code(404).send({ error: "No users exist in the selected range" });
			}
			return reply.code(200).send({ users });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const row = getNumberUsers.get();
			return reply.code(200).send({ n_users: row.n_users });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const userInfo = getUserInfo.get(request.params.userId);
			return reply.code(200).send({ userInfo });
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
			const { iStart, iEnd } = request.query;
			if (!iStart || !iEnd) {
				return reply.code(400).send({ error: "Please specify both a starting and an ending index" });
			}
			if (Number(iEnd) < Number(iStart)) {
				return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
			}
			const friends = getFriends.all(userId, Number(iEnd) - Number(iStart), Number(iStart));
			if (!friends.length) {
				return reply.code(404).send({ error: "No friends exist in the selected range" });
			}
			return reply.code(200).send({ friends });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/:userId/friends/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const row = getNumberFriends.get(userId);
			return reply.code(200).send({ n_friends: row.n_friends });
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
			const { iStart, iEnd } = request.query;
			if (!iStart || !iEnd) {
				return reply.code(400).send({ error: "Please specify both a starting and an ending index" });
			}
			if (Number(iEnd) < Number(iStart)) {
				return reply.code(400).send({ error: "Starting index cannot be strictly inferior to ending index" });
			}
			const matchHistoryId = getMatchHistory.all(userId, Number(iEnd) - Number(iStart), Number(iStart));
			if (!matchHistoryId.length) {
				return reply.code(404).send({ error: "No matches exist in the selected range" });
			}
			const promises = matchHistoryId.map(async (id) => {
				const res = await fetch('https://transcendence-api-scoreStore:3000/' + id, { method: "GET", headers: { "Content-Type": "application/json" } });
				if (!res.ok)
					throw new Error('Failed to fetch item from blockchain API');
				return res.json();
			});
			const matchHistory = await Promise.all(promises);
			return reply.code(200).send({ matchHistory });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.get('/users/:userId/matchHistory/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const row = getNumberMatches.get(userId);
			return reply.code(200).send({ n_matches: row.n_matches });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	// POST
	fastify.post('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			if (request.user.user !== 'admin') {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (getUserInfo.get(userId)) {
				return reply.code(400).send({ error: "User already exist" });
			}
			if (!request.body || !request.body.displayName) {
				return reply.code(400).send({ error: "Please specify a display name" });
			}
			createUser.run(userId, request.body.displayName);
			return reply.code(200).send({ msg: "User created successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.post('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!request.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			if (request.user !== 'admin' && request.user !== userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const friendId = request.params.friendId;
			if (!getUserInfo.get(friendId)) {
				return reply.code(404).send({ error: "Friend does not exist" });
			}
			if (friendId === userId) {
				return reply.code(400).send({ error: "You can't add yourself :D" });
			}
			if (getFriend.get(userId, friendId)) {
				return reply.code(400).send({ error: "Friend already added" });
			}
			addFriend.run(userId, friendId)
			return reply.code(200).send({ msg: "Friend added successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.post('/users/:userId/matchHistory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!request.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			if (request.user !== 'admin' && request.user !== userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			if (!request.body || !request.body.opponent || !request.body.p1Score || !request.body.p2Score) {
				return reply.code(400).send({ error: "Please specify the opponent and the score of both players" });
			}
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (!getUserInfo.get(request.body.opponent)) {
				return reply.code(404).send({ error: "Opponent does not exist" });
			}
			if (request.body.opponent === userId) {
				return reply.code(400).send({ error: "Do you have dementia ? You cannot have played a match against yourself gramps" });
			}
			if (request.body.p1Score < 0 || request.body.p2Score < 0) {
				return reply.code(400).send({ error: "A score cannot be strictly negative" });
			}
			const res = await fetch('http://localhost:3003/', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ p1: userId, p2: request.body.opponent, p1Score: request.body.p1Score, p2Score: request.body.p2Score }) });
			if (!res.ok)
				return reply.code(500).send({ error: "Internal server error" });
			addMatch.run(userId, res.id);
			if (request.body.p1Score > request.body.p2Score) {
				incWins.run(userId);
			} else if (request.body.p1Score < request.body.p2Score) {
				incLosses.run(userId);
			}
			return reply.code(200).send({ msg: "Match successfully saved to the blockchain" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	// PATCH
	fastify.patch('/users/:userId/:member', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			const userId = request.params.userId;
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			if (request.user.user !== 'admin' && request.user.user !== userId) {
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
				return reply.code(200).send({ msg: "Display name modified successfully" });
			}
			return reply.code(400).send({ error: "Member does not exist" })
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});

	// DELETE
	fastify.delete('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		try {
			if (!getUserInfo(request.params.userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			deleteMatchHistory.run(request.params.userId);
			deleteFriends.run(request.params.userId);
			deleteUser.run(request.params.userId);
			return reply.code(200).send({ msg: "User deleted successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.delete('/users/:userId/:member', { preHandler: fastify.authenticate }, async (request, reply) => {
		try {
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			const user = request.user.user;
			const member = request.params.member;
			if (user == 'admin' || user == request.params.userId) {
				if (member === 'displayName') {
					changeDisplayName.run("", request.params.userId);
					return reply.code(200).send({ msg: "Display name deleted successfully" });
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
	fastify.delete('/users/:userId/friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (request.user.user != 'admin' && request.user.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			deleteFriends.run(userId);
			return reply.code(200).send({ msg: "Friends deleted successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.delete('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (request.user.user != 'admin' && request.user.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			const friendId = request.params.friendId;
			if (!getFriend.get(friendId)) {
				return reply.code(404).send({ error: "Friend does not exist" });
			}
			deleteFriend.run(userId, friendId);
			return reply.code(200).send({ msg: "Friend deleted successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
	fastify.delete('/users/:userId/matchHistory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		try {
			if (!request.user || !request.user.user) {
				return reply.code(400).send({ error: "Please specify a user" });
			}
			const userId = request.params.userId;
			if (!getUserInfo.get(userId)) {
				return reply.code(404).send({ error: "User does not exist" });
			}
			if (request.user.user != 'admin' && request.user.user != userId) {
				return reply.code(401).send({ error: "Unauthorized" });
			}
			deleteMatchHistory.run(userId);
			deleteStats.run(userId);
			return reply.code(200).send({ msg: "Match history deleted successfully" });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: "Internal server error" });
		}
	});
}
