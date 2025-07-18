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
            passwordHash TEXT
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

const authDB = {
	prepareDB,
	checkUser,
	addUser,
	passwordQuery,
	RESERVED_USERNAMES
};

export default authDB;
