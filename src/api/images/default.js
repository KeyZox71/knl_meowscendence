import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import Database from 'better-sqlite3';
import multipart from '@fastify/multipart';

import { gImage } from './gImage.js';
import { pImage } from './pImage.js';
import { dImage } from './dImage.js';

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
const postImage = database.prepare('INSERT INTO images (fileName, mimeType, data) VALUES (?, ?, ?);');

// GET
const getImage = database.prepare('SELECT fileName, mimeType, data FROM images WHERE imageId = ?;');

// DELETE
const deleteImage = database.prepare('DELETE FROM images WHERE imageId = ?;');

export default async function(fastify, options) {
	fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET || '123456789101112131415161718192021',
		cookie: {
			cookieName: 'token',
		},
	});
	fastify.register(fastifyCookie);
	fastify.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } });

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
	fastify.get('/images/:imageId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return gImage(request, reply, fastify, getImage);
	});

	// POST
	fastify.post('/images', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return pImage(request, reply, fastify, postImage);
	});

	// DELETE
	fastify.delete('/images/:imageId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
		return dImage(request, reply, fastify, deleteImage);
	});
}
