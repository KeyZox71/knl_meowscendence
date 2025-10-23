import Database from 'better-sqlite3';

var env = process.env.NODE_ENV || 'development';
let database;
const RESERVED_USERNAMES = ['admin'];

if (!env || env === 'development') {
	database = new Database(":memory:", { verbose: console.log });
} else {
	var dbPath = process.env.DB_PATH || '/db/db.sqlite';
	database = new Database(dbPath);
}

/**
 *	@description	Can be used to prepare the database
 */
function prepareDB() {
	database.exec(`
	CREATE TABLE IF NOT EXISTS credentials (
		username TEXT PRIMARY KEY,
		passwordHash TEXT,
		totpHash TEXT DEFAULT NULL,
		totpEnabled INTEGER DEFAULT 0
	) STRICT
    `);
}

/**
 *	@param {string} name
 *
 *	@returns {boolean}
 */
function checkUser(name) {
	/** 
	 * @type: {import('better-sqlite3').Statement} 
	 */
	let userCheck = database.prepare('SELECT EXISTS (SELECT 1 FROM credentials WHERE username = ?);');
	const result = userCheck.get(name);
	const key = Object.keys(result)[0];

	return result[key] === 1;
}

function addUser(name, pass) {
	let userAdd = database.prepare('INSERT INTO credentials (username, passwordHash) VALUES (?, ?)');
	userAdd.run(name, pass);
}

function passwordQuery(user) {
	let passwordQuery = database.prepare('SELECT passwordHash FROM credentials WHERE username = ?;');
	return passwordQuery.get(user)
}

function setTOTPSecret(user, secret) {
	let setTOTP = database.prepare('UPDATE credentials SET totpHash = ? WHERE username = ?');
	setTOTP.run(secret, user);
}

function isTOTPEnabled(user) {
	const stmt = database.prepare('SELECT totpHash, totpEnabled FROM credentials WHERE username = ?');
	const result = stmt.get(user);
	return result && result.totpHash !== null && result.totpEnabled === 1;
}

function disableTOTP(user) {
	let stmt = database.prepare('UPDATE credentials SET totpHash = NULL, totpEnabled = 0 WHERE username = ?');
	stmt.run(user);
}

function queryTOTP(user) {
	let totpQuery = database.prepare('SELECT totpHash FROM credentials WHERE username = ?;');
	return totpQuery.get(user);
}

function enableTOTP(user) {
	let stmt = database.prepare('UPDATE credentials SET totpEnabled = 1 WHERE username = ?');
	stmt.run(user);
}

function getUser(user) {
	const stmt = database.prepare('SELECT * FROM credentials WHERE username = ?');
	return stmt.get(user);
}

function rmUser(user) {
	const stmt = database.prepare('DELETE * FROM credentials WHERE username = ?');
	stmt.run(user);
}

const authDB = {
	prepareDB,
	checkUser,
	rmUser,
	addUser,
	passwordQuery,
	setTOTPSecret,
	isTOTPEnabled,
	disableTOTP,
	queryTOTP,
	enableTOTP,
	getUser,
	RESERVED_USERNAMES
};

export default authDB;
