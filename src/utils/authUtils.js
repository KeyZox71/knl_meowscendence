import authDB from './authDB.js';

/**
 *	@param {string} value
 *
 *	@returns {boolean}
 */
export function isValidString(value) {
	return typeof value === 'string' && value.trim() !== '';
}

/**
 *	@param {string} name
 *	@param {import('better-sqlite3').Statement} userCheck
 *
 *	@returns {boolean}
 */
export function checkUser(name, userCheck) {
	const result = authDB.userCheck.get(name);
	const key = Object.keys(result)[0];

	return result[key] === 1;
}
