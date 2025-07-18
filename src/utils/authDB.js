import Database from 'better-sqlite3';

var env = process.env.NODE_ENV || 'development';
let database;
const RESERVED_USERNAMES = ['admin'];
let userCheck, passwordQuery, userAdd;

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
	userCheck = database.prepare('SELECT EXISTS (SELECT 1 FROM credentials WHERE username = ?);');
	passwordQuery = database.prepare('SELECT passwordHash FROM credentials WHERE username = ?;');
	userAdd = database.prepare('INSERT INTO credentials (username, passwordHash) VALUES (?, ?)');
}


const authDB = {
	prepareDB,
	get userCheck() { return userCheck; },
	get userAdd() { return userAdd; },
	get passwordQuery() { return passwordQuery; },
	RESERVED_USERNAMES
};

export default authDB;
