import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';

import { gUsers } from './gUsers.js'
import { gUser } from './gUser.js'
import { gNumberUsers } from './gNumberUsers.js'
import { gFriends } from './gFriends.js'
import { gNumberFriends } from './gNumberFriends.js'
import { gMatchHistory } from './gMatchHistory.js'
import { gNumberMatches } from './gNumberMatches.js'
import { pUser } from './pUser.js'
import { pFriend } from './pFriend.js'
import { pMatchHistory } from './pMatchHistory.js'
import { uMember } from './uMember.js'
import { dUser } from './dUser.js'
import { dMember } from './dMember.js'
import { dFriends } from './dFriends.js'
import { dFriend } from './dFriend.js'
import { dMatchHistory } from './dMatchHistory.js'

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

const querySchema = { type: 'object', required: ['iStart', 'iEnd'], properties: { iStart: { type: 'integer', minimum: 0 }, iEnd: { type: 'integer', minimum: 0 } } }
const bodySchema = { type: 'object', required: ['opponent', 'myScore', 'opponentScore'], properties: { opponent: { type: 'string' }, myScore: { type: 'integer', minimum: 0 }, opponentScore: { type: 'integer', minimum: 0 } } }

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
	fastify.get('/users/:userId/matchHistory', { preHandler: [fastify.authenticate], schema: { querystring: querySchema } }, async (request, reply) => {
		return gMatchHistory(request, reply, fastify, getUserInfo, getMatchHistory);
	});
	fastify.get('/users/:userId/matchHistory/count', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gNumberMatches(request, reply, fastify, getUserInfo, getNumberMatches);
	});

	// POST
	fastify.post('/users/:userId', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
		return pUser(request, reply, fastify, getUserInfo, createUser);
	});
	fastify.post('/users/:userId/friends/:friendId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return pFriend(request, reply, fastify, getUserInfo, getFriend, addFriend);
	});
	fastify.post('/users/:userId/matchHistory', { preHandler: [fastify.authenticate], schema: { body: bodySchema } }, async (request, reply) => {
		return pMatchHistory(request, reply, fastify, getUserInfo, addMatch, incWins, incLosses);
	});

	// PATCH
	fastify.patch('/users/:userId/:member', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return uMember(request, reply, fastify, getUserInfo, changeDisplayName);
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
	fastify.delete('/users/:userId/matchHistory', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return dMatchHistory(request, reply, fastify, getUserInfo, deleteMatchHistory, deleteStats);
	});
}
