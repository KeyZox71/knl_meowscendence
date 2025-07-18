import authDB from './authDB.js';

/**
 *	@param {string} value
 *
 *	@returns {boolean}
 */
export function isValidString(value) {
	return typeof value === 'string' && value.trim() !== '';
}
