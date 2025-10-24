import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors'
import Database from 'better-sqlite3';
import cors from '@fastify/cors';

import { gUsers } from './gUsers.js';
import { gUser } from './gUser.js';
import { gNumberUsers } from './gNumberUsers.js';
import { gFriends } from './gFriends.js';
import { gNumberFriends } from './gNumberFriends.js';
import { gMatchHistory } from './gMatchHistory.js';
import { gNumberMatches } from './gNumberMatches.js';
import { pUser } from './pUser.js';
import { pFriend } from './pFriend.js';
import { pMatchHistory } from './pMatchHistory.js';
import { uMember } from './uMember.js';
import { dUser } from './dUser.js';
import { dMember } from './dMember.js';
import { dFriends } from './dFriends.js';
import { dFriend } from './dFriend.js';
import { dMatchHistory } from './dMatchHistory.js';
import { pAvatar } from './pAvatar.js';
import { gAvatar } from './gAvatar.js';
import { uAvatar } from './uAvatar.js';
import { dAvatar } from './dAvatar.js';
import { pPing } from './pPing.js';
import { gPing } from './gPing.js';

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
			avatarId INTEGER,
			pongWins INTEGER,
			pongLosses INTEGER,
			tetrisWins INTEGER,
			tetrisLosses INTEGER,
			UNIQUE(username),
			CHECK(pongWins >= 0),
			CHECK(pongLosses >= 0),
			CHECK(tetrisWins >= 0),
			CHECK(tetrisLosses >= 0)
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
			game TEXT,
			date INTEGER,
			player1 TEXT,
			player2 TEXT,
			matchId INTEGER,
			CHECK(game = 'pong' OR game = 'tetris'),
			CHECK(date >= 0),
			CHECK(player1 != player2)
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS activityTime (
			username TEXT PRIMARY KEY,
			time TEXT
		) STRICT
	`);
	database.exec(`
		CREATE TABLE IF NOT EXISTS images (
			imageId INTEGER PRIMARY KEY AUTOINCREMENT,
			fileName TEXT,
			mimeType TEXT,
			data BLOB
		) STRICT
	`);
}

prepareDB();

// POST
const createUser = database.prepare('INSERT INTO userData (username, displayName, avatarId, pongWins, pongLosses, tetrisWins, tetrisLosses) VALUES (?, ?, -1, 0, 0, 0, 0);');
const addFriend = database.prepare('INSERT INTO friends (username, friendName) VALUES (?, ?);');
const addMatch = database.prepare('INSERT INTO matchHistory (game, date, player1, player2, matchId) VALUES (?, ?, ?, ?, ?);');
const incWinsPong = database.prepare('UPDATE userData SET pongWins = pongWins + 1 WHERE username = ?;');
const incLossesPong = database.prepare('UPDATE userData SET pongLosses = pongLosses + 1 WHERE username = ?');
const incWinsTetris = database.prepare('UPDATE userData SET tetrisWins = tetrisWins + 1 WHERE username = ?;');
const incLossesTetris = database.prepare('UPDATE userData SET tetrisLosses = tetrisLosses + 1 WHERE username = ?');
const setAvatarId = database.prepare('UPDATE userData SET avatarId = ? WHERE username = ?;');
const postImage = database.prepare('INSERT INTO images (fileName, mimeType, data) VALUES (?, ?, ?);');
const setActivityTime = database.prepare(`
  INSERT INTO activityTime (username, time)
  VALUES (?, ?)
  ON CONFLICT(username) DO UPDATE SET time = excluded.time;
`);

// PATCH
const changeDisplayName = database.prepare('UPDATE userData SET displayName = ? WHERE username = ?;');
const changeAvatarId = database.prepare('UPDATE userData SET avatarId = ? WHERE username = ?;');

// GET
const getUserData = database.prepare('SELECT username, displayName, pongWins, pongLosses, tetrisWins, tetrisLosses FROM userData LIMIT ? OFFSET ?;');
const getUserInfo = database.prepare('SELECT username, displayName, pongWins, pongLosses, tetrisWins, tetrisLosses FROM userData WHERE username = ?;');
const getFriends = database.prepare('SELECT friendName FROM friends WHERE username = ? LIMIT ? OFFSET ?;');
const getFriend = database.prepare('SELECT friendName FROM friends WHERE username = ? AND friendName = ?;');
const getMatchHistory = database.prepare('SELECT matchId, date FROM matchHistory WHERE game = ? AND ? IN (player1, player2) LIMIT ? OFFSET ?;');
const getNumberUsers = database.prepare('SELECT COUNT (DISTINCT username) AS n_users FROM userData;');
const getNumberFriends = database.prepare('SELECT COUNT (DISTINCT friendName) AS n_friends FROM friends WHERE username = ?;');
const getNumberMatches = database.prepare('SELECT COUNT (DISTINCT id) AS n_matches FROM matchHistory WHERE game = ? AND ? IN (player1, player2);');
const getAvatarId = database.prepare('SELECT avatarId FROM userData WHERE username = ?;');
const getImage = database.prepare('SELECT fileName, mimeType, data FROM images WHERE imageId = ?;');
const getActivityTime = database.prepare('SELECT time FROM activityTime WHERE username = ?;')

// DELETE
const deleteUser = database.prepare('DELETE FROM userData WHERE username = ?;');
const deleteFriend = database.prepare('DELETE FROM friends WHERE username = ? AND friendName = ?;');
const deleteFriends = database.prepare('DELETE FROM friends WHERE username = ?;');
const deleteMatchHistory = database.prepare('DELETE FROM matchHistory WHERE game = ? AND ? IN (player1, player2);');
const deleteStatsPong = database.prepare('UPDATE userData SET pongWins = 0, pongLosses = 0 WHERE username = ?;');
const deleteStatsTetris = database.prepare('UPDATE userData SET tetrisWins = 0, tetrisLosses = 0 WHERE username = ?;');
const deleteAvatarId = database.prepare('UPDATE userData SET avatarId = -1 WHERE username = ?;');
const deleteImage = database.prepare('DELETE FROM images WHERE imageId = ?;');

const querySchema = { type: 'object', required: ['iStart', 'iEnd'], properties: { iStart: { type: 'integer', minimum: 0 }, iEnd: { type: 'integer', minimum: 0 } } };
const bodySchemaMember = { type: 'object', properties: { displayName: { type: 'string' } } };
const querySchemaMatchHistory = { type: 'object', required: ['game', 'iStart', 'iEnd'], properties: { game: { type: 'string' }, iStart: { type: 'integer', minimum: 0 }, iEnd: { type: 'integer', minimum: 0 } } };
const bodySchemaMatchHistory = { type: 'object', required: ['game', 'date', 'myScore'], properties: { game: { type: 'string' }, date: { type: 'integer', minimum: 0 }, opponent: { type: 'string' }, myScore: { type: 'integer', minimum: 0 }, opponentScore: { type: 'integer', minimum: 0 } } };
const querySchemaMatchHistoryGame = { type: 'object', required: ['game'], properties: { game: { type: 'string' } } };

/**
 *	@param {import('fastify').FastifyInstance} fastify
 *	@param {import('fastify').FastifyPluginOptions} options
 */
export default async function(fastify, options) {

	fastify.register(cors, {
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
		methods: [ "GET", "POST", "PATCH", "DELETE", "OPTIONS" ]
	});

	fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET || '123456789101112131415161718192021',
		cookie: {
			cookieName: 'token',
		},
	});
	fastify.register(fastifyCookie);
	fastify.register(cors, {
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
		methods: [ "GET", "POST", "PATCH", "DELETE", "OPTIONS" ]
	});

	fastify.addContentTypeParser(
		['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
		{ parseAs: 'buffer' },
		async (request, payload) => payload
	);

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
			request.user = jwt.user;
		} catch (err) {
			reply.code(401).send({ error: 'Unauthorized' });
		}
	});

	// GET
	fastify.get('/users', { preHandler: [fastify.authenticate], schema: { querystring: querySchema } }, async (request, reply) => {
		return gUsers(request, reply, fastify, getUserData);
	});
	fastify.get('/users/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gNumberUsers(request, reply, fastify, getNumberUsers);
	});
	fastify.get('/users/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gUser(request, reply, fastify, getUserInfo);
	});
	fastify.get('/users/:userId/friends', { preHandler: [fastify.authenticate], schema: { querystring: querySchema } }, async (request, reply) => {
		return gFriends(request, reply, fastify, getUserInfo, getFriends);
	});
	fastify.get('/users/:userId/friends/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gNumberFriends(request, reply, fastify, getUserInfo, getNumberFriends);
	});
	fastify.get('/users/:userId/matchHistory', { preHandler: [fastify.authenticate], schema: { querystring: querySchemaMatchHistory } }, async (request, reply) => {
		return gMatchHistory(request, reply, fastify, getUserInfo, getMatchHistory);
	});
	fastify.get('/users/:userId/matchHistory/count', { preHandler: [fastify.authenticate], schema: { query: querySchemaMatchHistoryGame } }, async (request, reply) => {
		return gNumberMatches(request, reply, fastify, getUserInfo, getNumberMatches);
	});
	fastify.get('/users/:userId/avatar', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gAvatar(request, reply, fastify, getUserInfo, getAvatarId, getImage);
	});
	fastify.get('/ping/:userId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gPing(request, reply, fastify, getActivityTime);
	});

	// POST
	fastify.post('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		return pUser(request, reply, fastify, getUserInfo, createUser);
	});
	fastify.post('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return pFriend(request, reply, fastify, getUserInfo, getFriend, addFriend);
	});
	fastify.post('/users/:userId/matchHistory', { preHandler: [fastify.authenticate], schema: { body: bodySchemaMatchHistory } }, async (request, reply) => {
		return pMatchHistory(request, reply, fastify, getUserInfo, addMatch, incWinsPong, incLossesPong, incWinsTetris, incLossesTetris);
	});
	fastify.post('/users/:userId/avatar', { bodyLimit: 5242880, preHandler: [fastify.authenticate] }, async (request, reply) => {
		return pAvatar(request, reply, fastify, getUserInfo, setAvatarId, postImage);
	});
	fastify.post('/ping', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return pPing(request, reply, fastify, setActivityTime);
	})

	// PATCH
	fastify.patch('/users/:userId/avatar', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return uAvatar(request, reply, fastify, getUserInfo, setAvatarId, getAvatarId, deleteAvatarId, postImage, deleteImage);
	});
	fastify.patch('/users/:userId/:member', { preHandler: [fastify.authenticate], schema: { body: bodySchemaMember } }, async (request, reply) => {
		return uMember(request, reply, fastify, getUserInfo, changeDisplayName, changeAvatarId);
	});

	// DELETE
	fastify.delete('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		return dUser(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteFriends, deleteUser);
	});
	fastify.delete('/users/:userId/:member', { preHandler: fastify.authenticate }, async (request, reply) => {
		return dMember(request, reply, fastify, getUserInfo, changeDisplayName);
	});
	fastify.delete('/users/:userId/friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return dFriends(request, reply, fastify, getUserInfo, deleteFriends);
	});
	fastify.delete('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return dFriend(request, reply, fastify, getUserInfo, getFriend, deleteFriend);
	});
	fastify.delete('/users/:userId/matchHistory', { preHandler: [fastify.authenticate], schema: { query: querySchemaMatchHistoryGame } }, async (request, reply) => {
		return dMatchHistory(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteStatsPong, deleteStatsTetris);
	});
	fastify.delete('/users/:userId/avatar', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return dAvatar(request, reply, fastify, getUserInfo, getAvatarId, deleteAvatarId, deleteImage);
	});
}
