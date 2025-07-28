import { Int } from "@avalabs/avalanchejs";
import Database from "better-sqlite3";

var env = process.env.NODE_ENV || 'development';
let database;

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
	CREATE TABLE IF NOT EXISTS scoresTx (
		id INTEGER PRIMARY KEY,
		txHash TEXT
	) STRICT
	`);
}

/**
 *	@description	Can be used to add a score hash to the DB
 *	@param {Int}	The id of the score
 *	@param {String}	The hash of the score
 */
function addTx(id, txHash) {
	const txAdd = database.prepare('INSERT INTO scoresTx (id, txHash) VALUES (?, ?)');
	txAdd.run(id, txHash);
}

/**
 *	@description		Can be used to get a tx hash from an id
 *	@param {Int}		The id to get
 *	@returns {String}	The tx hash
 */
function getTx(id) {
	const txGet = database.prepare('SELECT txHash FROM credentials WHERE id = ?;')
	return txGet.get(id);
}

const scoreDB = {
	prepareDB,
	addTx,
	getTx
};

export default scoreDB;
