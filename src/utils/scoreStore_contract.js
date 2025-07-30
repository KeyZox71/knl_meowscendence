import { ethers } from "ethers";
import { readFile } from "fs/promises";

export const rpc_url = process.env.AVAX_RPC_URL;
export const contract_addr = process.env.AVAX_CONTRACT_ADDR;
export const owner_priv_key = process.env.AVAX_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(rpc_url);

const wallet = new ethers.Wallet(owner_priv_key, provider);

async function loadContract() {
	try {
		const contractABI = JSON.parse(await readFile(new URL('../contract/scoreStore.json', import.meta.url)));

		const contract = new ethers.Contract(contract_addr, contractABI, wallet);
		return contract;
	} catch (error) {
		console.error('Error loading contract ABI:', error);
		throw error;
	}
}

/**
 *	@param {int} id
 *	@returns {Promise<Object>} A promise that resolves to the score details if successful.
 *	@throws {Error} Throws an error if the function call fails.
 */
async function callGetScore(id) {
	try {
		const contract = await loadContract();
		const result = await contract.getScore(id);
		return result;
	} catch (error) {
		console.error('Error calling view function:', error);
		throw error;
	}
}

/**
 * Adds a new score to the smart contract.
 *
 * @async
 * @param {string} p1 - The name of the first player.
 * @param {string} p2 - The name of the second player.
 * @param {number} p1Score - The score of the first player.
 * @param {number} p2Score - The score of the second player.
 * @returns {Promise<ethers.ContractTransactionResponse>} A promise that resolves to the transaction response if successful.
 * @throws {Error} Throws an error if the function call fails.
 */
async function callAddScore(p1, p2, p1Score, p2Score) {
	try {
		const contract = await loadContract();
		const tx = await contract.addScore(p1, p2, p1Score, p2Score);
		console.log('Transaction sent:', tx.hash);
		await tx.wait(); // Wait for the transaction to be mined
		console.log('Transaction confirmed');
		return tx;
	} catch (error) {
		console.error('Error calling addScore function:', error);
		throw error;
	}
}

/**
 * Fetches the last ID from the smart contract.
 *
 * @async
 * @returns {Promise<number>} A promise that resolves to the last ID.
 * @throws {Error} Throws an error if the function call fails.
 */
async function callLastId() {
	try {
		const contract = await loadContract();
		const lastId = await contract.lastId();
		console.log('Last ID:', lastId.toString());
		return lastId;
	} catch (error) {
		console.error('Error calling lastId function:', error);
		throw error;
	}
}

export {
	callAddScore,
	callGetScore,
	callLastId
};
