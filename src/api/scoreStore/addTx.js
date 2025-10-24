import scoreDB from "../../utils/scoreDB.js";
import { callAddScore, callLastId } from "../../utils/scoreStore_contract.js";

/**
 *	@async
 *	@param {import("fastify").FastifyRequest} request
 *	@param {import("fastify").FastifyReply} reply
 *	@param {import("fastify").FastifyInstance} fastify
 */
export async function addTx(request, reply, fastify) {
	try {
		const {tx, id} = await callAddScore(request.body.p1, request.body.p2, request.body.p1Score, request.body.p2Score);

		scoreDB.addTx(id, tx.hash);
		// tx.then(tx => {
		// });

		return reply.code(200).send({
			id: Number(id)
		});
	} catch (err) {
		fastify.log.error(err);
		return reply.code(500).send({ error: "Internal server error" });
	}
}
